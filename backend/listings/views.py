from rest_framework import viewsets, permissions, filters
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing
from .serializers import (
    VehicleSerializer,
    VehicleCreateSerializer,
    ListingImageCreateSerializer,
    ListingSerializer,
    ListingCreateSerializer,
    ListingUpdateSerializer,
    
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


class ExploreView(viewsets.ReadOnlyModelViewSet):
    """
    AI-powered explore view with semantic search, intent-based filtering,
    and dynamic budget calculation.
    
    Query Parameters:
    - q: Natural language search query (semantic search)
    - intent_id: Pre-baked intent identifier (e.g., 'sahel_summer', 'cairo_budget')
    - governorate: Filter by governorate
    - category: Filter by vehicle category
    - transmission: Filter by transmission type
    - min_price: Minimum daily price
    - max_price: Maximum daily price
    - ordering: Sort field (e.g., 'daily_price', '-created_at')
    """
    serializer_class = ListingSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Will use default from settings
    
    def get_queryset(self):
        """Override to prevent default queryset - we handle this in list()"""
        return Listing.objects.none()
    
    def list(self, request):
        """
        Main explore endpoint that handles all query types.
        """
        from listings.intents import get_intent_config
        from pgvector.django import L2Distance
        from openai import OpenAI
        from django.conf import settings
        import numpy as np
        
        # Start with active listings
        queryset = Listing.objects.filter(status='ACTIVE').select_related(
            'vehicle', 'owner'
        ).prefetch_related('images', 'vehicle__images')
        
        # Get query parameters
        query = request.query_params.get('q')
        intent_id = request.query_params.get('intent_id')
        governorate = request.query_params.get('governorate')
        category = request.query_params.get('category')
        transmission = request.query_params.get('transmission')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        ordering = request.query_params.get('ordering', '-created_at')
        
        # Handle intent-based queries
        if intent_id:
            intent_config = get_intent_config(intent_id)
            
            if not intent_config:
                return Response(
                    {'error': f'Invalid intent_id: {intent_id}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Apply intent filters
            if 'filters' in intent_config:
                queryset = queryset.filter(**intent_config['filters'])
            
            # Handle budget percentile calculation
            if intent_config.get('use_budget_percentile'):
                percentile = intent_config.get('percentile', 20)
                
                # Get the governorate from filters if specified
                intent_filters = intent_config.get('filters', {})
                target_governorate = intent_filters.get('governorate')
                
                if target_governorate:
                    # Calculate percentile for this governorate
                    prices = list(
                        Listing.objects.filter(
                            status='ACTIVE',
                            governorate=target_governorate
                        ).values_list('daily_price', flat=True)
                    )
                    
                    if prices:
                        # Convert Decimal to float for numpy compatibility
                        prices_float = [float(p) for p in prices]
                        threshold = np.percentile(prices_float, percentile)
                        queryset = queryset.filter(daily_price__lte=threshold)
            
            # Handle semantic query from intent
            if 'semantic_query' in intent_config:
                query = intent_config['semantic_query']
            
            # Apply intent-specific ordering
            if 'ordering' in intent_config:
                ordering = intent_config['ordering']
        
        # Apply standard filters
        if governorate:
            queryset = queryset.filter(governorate=governorate)
        
        if category:
            queryset = queryset.filter(vehicle__category=category)
        
        if transmission:
            queryset = queryset.filter(vehicle__transmission=transmission)
        
        if min_price:
            try:
                queryset = queryset.filter(daily_price__gte=float(min_price))
            except ValueError:
                return Response(
                    {'error': 'Invalid min_price value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if max_price:
            try:
                queryset = queryset.filter(daily_price__lte=float(max_price))
            except ValueError:
                return Response(
                    {'error': 'Invalid max_price value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Handle natural language semantic search
        if query:
            try:
                # Generate embedding for the search query
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                
                response = client.embeddings.create(
                    model="text-embedding-3-small",
                    input=query,
                    encoding_format="float"
                )
                
                query_embedding = response.data[0].embedding
                
                # Use pgvector L2Distance for similarity search
                # Only search listings that have embeddings
                queryset = queryset.filter(embedding__isnull=False).annotate(
                    distance=L2Distance('embedding', query_embedding)
                ).order_by('distance')
                
            except Exception as e:
                return Response(
                    {'error': f'Error performing semantic search: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Apply ordering if no semantic search
            if ordering:
                queryset = queryset.order_by(ordering)
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def intents(self, request):
        """
        List all available pre-baked intents.
        """
        from listings.intents import list_all_intents
        
        intents = list_all_intents()
        return Response({'intents': intents})

