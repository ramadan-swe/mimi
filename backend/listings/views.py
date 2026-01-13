from rest_framework import viewsets, permissions, filters
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing, RentalRequest, Availability
from .serializers import (
    VehicleSerializer,
    VehicleCreateSerializer,
    ListingImageCreateSerializer,
    ListingSerializer,
    ListingCreateSerializer,
    ListingUpdateSerializer,
    RentalRequestSerializer,
    RentalRequestCreateSerializer,
    AvailabilitySerializer,
)
from .permissions import IsOwnerOrReadOnly, IsVerified, CanCreateListing
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'governorate', 'vehicle__transmission', 'vehicle__fuel_type', 'vehicle__category', 'owner']
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
            ).select_related('vehicle', 'owner').prefetch_related('images').distinct()
        
        # Unauthenticated users only see active listings
        return Listing.objects.filter(status='ACTIVE').select_related('vehicle', 'owner').prefetch_related('images')

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


class RentalRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing rental requests.
    
    Endpoints:
    - POST /api/rentals/ - Create a rental request (renters)
    - GET /api/rentals/ - List user's rental requests
    - GET /api/rentals/incoming/ - List incoming requests (for owners)
    - POST /api/rentals/{id}/accept/ - Accept a rental request (owner)
    - POST /api/rentals/{id}/reject/ - Reject a rental request (owner)
    - POST /api/rentals/{id}/cancel/ - Cancel a rental request (renter)
    """
    serializer_class = RentalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return rental requests relevant to the current user (as renter or owner)"""
        user = self.request.user
        return RentalRequest.objects.filter(
            Q(renter=user) | Q(listing__owner=user)
        ).select_related('listing', 'listing__vehicle', 'listing__owner', 'renter').distinct()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RentalRequestCreateSerializer
        return RentalRequestSerializer
    
    @action(detail=False, methods=['get'])
    def incoming(self, request):
        """Get rental requests for listings owned by the current user"""
        requests = RentalRequest.objects.filter(
            listing__owner=request.user
        ).select_related('listing', 'listing__vehicle', 'renter').order_by('-created_at').distinct()
        
        page = self.paginate_queryset(requests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a rental request (owner only)"""
        rental_request = self.get_object()
        
        if rental_request.listing.owner != request.user:
            return Response(
                {'error': 'You are not the owner of this listing'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental_request.status != 'PENDING':
            return Response(
                {'error': f'Cannot accept a request with status: {rental_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental_request.status = 'ACCEPTED'
        rental_request.save()
        
        return Response(RentalRequestSerializer(rental_request).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a rental request (owner only)"""
        rental_request = self.get_object()
        
        if rental_request.listing.owner != request.user:
            return Response(
                {'error': 'You are not the owner of this listing'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental_request.status != 'PENDING':
            return Response(
                {'error': f'Cannot reject a request with status: {rental_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental_request.status = 'REJECTED'
        rental_request.save()
        
        return Response(RentalRequestSerializer(rental_request).data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a rental request (renter only)"""
        rental_request = self.get_object()
        
        if rental_request.renter != request.user:
            return Response(
                {'error': 'You can only cancel your own rental requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental_request.status not in ['PENDING', 'ACCEPTED']:
            return Response(
                {'error': f'Cannot cancel a request with status: {rental_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental_request.status = 'CANCELLED'
        rental_request.save()
        
        return Response(RentalRequestSerializer(rental_request).data)


class AvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing listing availability.
    
    Endpoints:
    - GET /api/listings/{listing_id}/availability/ - Get availability for a listing
    - GET /api/listings/{listing_id}/unavailable-dates/ - Get unavailable dates for calendar
    """
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        listing_id = self.kwargs.get('listing_pk')
        return Availability.objects.filter(listing_id=listing_id)
    
    @action(detail=False, methods=['get'], url_path='unavailable-dates')
    def unavailable_dates(self, request, listing_pk=None):
        """
        Get a list of unavailable dates for the next 90 days.
        Returns dates that are either:
        1. Part of an ACCEPTED rental request
        2. Explicitly marked as unavailable in Availability model
        """
        listing_id = listing_pk
        today = date.today()
        end_date = today + timedelta(days=90)
        
        unavailable_dates = set()
        
        # Get dates from ACCEPTED rental requests only
        rental_requests = RentalRequest.objects.filter(
            listing_id=listing_id,
            status='ACCEPTED',
            end_date__gte=today,
            start_date__lte=end_date
        )
        
        for rental in rental_requests:
            current = max(rental.start_date, today)
            # Include end_date (inclusive rental period)
            while current <= rental.end_date and current <= end_date:
                unavailable_dates.add(current.isoformat())
                current += timedelta(days=1)
        
        # Get dates from unavailable periods
        unavailable_periods = Availability.objects.filter(
            listing_id=listing_id,
            is_available=False,
            date_end__gte=today,
            date_start__lte=end_date
        )
        
        for period in unavailable_periods:
            current = max(period.date_start, today)
            while current <= period.date_end and current <= end_date:
                unavailable_dates.add(current.isoformat())
                current += timedelta(days=1)
        
        # Also check for dates NOT covered by availability periods (if any exist)
        available_periods = Availability.objects.filter(
            listing_id=listing_id,
            is_available=True
        )
        
        if available_periods.exists():
            # If explicit availability is set, dates outside those periods are unavailable
            all_dates = set()
            current = today
            while current <= end_date:
                all_dates.add(current)
                current += timedelta(days=1)
            
            available_date_set = set()
            for period in available_periods:
                current = max(period.date_start, today)
                while current <= period.date_end and current <= end_date:
                    available_date_set.add(current)
                    current += timedelta(days=1)
            
            # Dates not in any available period are unavailable
            for d in all_dates:
                if d not in available_date_set:
                    unavailable_dates.add(d.isoformat())
        
        return Response({
            'unavailable_dates': sorted(list(unavailable_dates)),
            'range_start': today.isoformat(),
            'range_end': end_date.isoformat()
        })
