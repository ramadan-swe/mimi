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
    
    class Meta:
        model = Listing
        fields = ['status', 'governorate', 'vehicle__transmission', 'vehicle__fuel_type', 'vehicle__category', 'owner']
    