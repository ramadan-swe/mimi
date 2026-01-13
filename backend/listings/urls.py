from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ListingViewSet, basename='listing')

urlpatterns = [
    path('explore/', views.ExploreView.as_view({'get': 'list'}), name='explore'),
    path('explore/intents/', views.ExploreView.as_view({'get': 'intents'}), name='explore-intents'),
    path('', include(router.urls)),
]

