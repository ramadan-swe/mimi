from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rentals', views.RentalRequestViewSet, basename='rental')
router.register(r'', views.ListingViewSet, basename='listing')

urlpatterns = [
    path('explore/', views.ExploreView.as_view({'get': 'list'}), name='explore'),
    path('explore/intents/', views.ExploreView.as_view({'get': 'intents'}), name='explore-intents'),
    # Availability endpoint for a specific listing
    path('<int:listing_pk>/availability/', views.AvailabilityViewSet.as_view({'get': 'list'}), name='listing-availability'),
    path('<int:listing_pk>/availability/unavailable-dates/', views.AvailabilityViewSet.as_view({'get': 'unavailable_dates'}), name='listing-unavailable-dates'),
    path('', include(router.urls)),
]

