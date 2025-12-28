from rest_framework import viewsets, permissions
from .models import Listing
from .models import Listing, ListingImage
from .serializers import ListingSerializer, ListingImageCreateSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        This view should return a list of all active listings
        to the public, but all listings for the owner.
        """
        user = self.request.user
        
        # If user is authenticated, they can see their own listings regardless of status
        if user.is_authenticated:
            # This logic mimics: (status='ACTIVE') OR (owner=user)
            # But implementing it via queryset union or Q objects is cleaner
            from django.db.models import Q
            return Listing.objects.filter(
                Q(status='ACTIVE') | Q(owner=user)
            ).distinct()
        
        # Unauthenticated users only see active listings
        return Listing.objects.filter(status='ACTIVE')

    def perform_create(self, serializer):
        user = self.request.user
        if not user.can_create_listing():
            raise PermissionDenied("You have reached the maximum number of listings for your subscription.")
        serializer.save(owner=user)

    @action(detail=True, methods=['post'], serializer_class=ListingImageCreateSerializer)
    def upload_image(self, request, pk=None):
        listing = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(listing=listing)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
