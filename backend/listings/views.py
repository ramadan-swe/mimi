from rest_framework import viewsets, permissions, filters
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing, ListingImage
from .serializers import (
    ListingSerializer,
    ListingCreateSerializer,
    ListingUpdateSerializer,
    ListingImageCreateSerializer
)
from .permissions import IsOwnerOrReadOnly, IsVerified, CanCreateListing
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'governorate', 'vehicle__transmission', 'vehicle__fuel_type', 'vehicle__category']
    search_fields = ['title', 'vehicle__brand', 'vehicle__model', 'city']
    ordering_fields = ['daily_price', 'created_at', 'vehicle__year']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        This view should return a list of all active listings
        to the public, but all listings for the owner.
        """
        user = self.request.user
        
        # If user is authenticated, they can see their own listings regardless of status
        if user.is_authenticated:
            # This logic mimics: (status='ACTIVE') OR (owner=user)
            return Listing.objects.filter(
                Q(status='ACTIVE') | Q(owner=user)
            ).select_related('vehicle', 'owner').prefetch_related('images', 'vehicle__images').distinct()
        
        # Unauthenticated users only see active listings
        return Listing.objects.filter(status='ACTIVE').select_related('vehicle', 'owner').prefetch_related('images', 'vehicle__images')

    def get_serializer_class(self):
        """Return appropriate serializer class based on action"""
        if self.action == 'create':
            return ListingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ListingUpdateSerializer
        return ListingSerializer

    def get_permissions(self):
        """Instantiate and return the list of permissions for this action"""
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsVerified, CanCreateListing]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Set owner when creating listing"""
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        """
        Soft delete the listing instead of removing it from the DB.
        """
        instance.status = 'HIDDEN'
        instance.save()

    @action(detail=True, methods=['post'], serializer_class=ListingImageCreateSerializer)
    def upload_image(self, request, pk=None):
        """Upload an image for a listing"""
        listing = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(listing=listing)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
