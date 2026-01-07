from django.urls import path
from .views import SendOTPView, VerifyOTPView

urlpatterns = [
    path('auth/verify-phone/', SendOTPView.as_view(), name='verify-phone'),
    path('auth/confirm-otp/', VerifyOTPView.as_view(), name='confirm-otp'),
]
