from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.SubscriptionPlanViewSet, basename='plans')

urlpatterns = [
    path('', include(router.urls)),
    path('subscribe/', views.subscribe_to_plan),
    path('manage/', views.manage_subscription_api),
    path('webhook/paymob/', views.paymob_unified_webhook),
    path('subscription/current/', views.get_current_subscription, name='current-subscription'),

]