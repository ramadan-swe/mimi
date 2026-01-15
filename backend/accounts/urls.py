from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    ProfileView,
    SendOTPView,
    VerifyOTPView,
    PublicUserProfileView,
    IDVerificationView
)

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/verify-phone/', SendOTPView.as_view(), name='verify-phone'),
    path('auth/confirm-otp/', VerifyOTPView.as_view(), name='confirm-otp'),
    path('auth/verify-identity/', IDVerificationView.as_view(), name='verify-identity'),
    path('users/<int:pk>/', PublicUserProfileView.as_view(), name='public-user-profile'),
]
