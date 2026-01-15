"""
Custom filters for the listings app.
"""
import django_filters
from .models import Listing


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    """Filter that accepts comma-separated values and uses __in lookup."""
    pass


class ListingFilter(django_filters.FilterSet):
    """
    Custom filterset for Listing that handles comma-separated values
    for category, transmission, and fuel_type filters.
    """
    # Support comma-separated values for these fields (e.g., category=PREMIUM,TOP)
    vehicle__category = CharInFilter(field_name='vehicle__category', lookup_expr='in')
    vehicle__transmission = CharInFilter(field_name='vehicle__transmission', lookup_expr='in')
    vehicle__fuel_type = CharInFilter(field_name='vehicle__fuel_type', lookup_expr='in')
    
    # Custom filter for JSON features
    features = django_filters.CharFilter(method='filter_features')
    
    class Meta:
        model = Listing
        fields = ['status', 'governorate', 'vehicle__transmission', 'vehicle__fuel_type', 'vehicle__category', 'vehicle__seats', 'owner']
        
    def filter_features(self, queryset, name, value):
        """
        Filter by vehicle extras.
        Value is a comma-separated string of features (e.g., "GPS,Cruise Control").
        Backend keys use underscores (e.g., "Cruise_Control").
        """
        if not value:
            return queryset
            
        features_list = value.split(',')
        for feature in features_list:
            # Convert "Cruise Control" to "Cruise_Control"
            db_key = feature.strip().replace(' ', '_')
            
            # Filter for {key: True} in the extras JSONField
            queryset = queryset.filter(vehicle__extras__contains={db_key: True})
            
        return queryset
    