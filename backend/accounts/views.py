from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    ProfileSerializer,
    PhoneVerificationSerializer,
    OTPConfirmationSerializer
)
from .services import send_whatsapp_otp
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"status": "success", "message": "User registered successfully."},
            status=status.HTTP_201_CREATED
        )


class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class SendOTPView(views.APIView):
    permission_classes = [] # Allow unauthenticated access if verifying during registration? 
                            # Or strict it? Assuming user might be logged in or providing phone.
                            # For safety, let's keep it open but rate limited ideally.
    
    def post(self, request):
        serializer = PhoneVerificationSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            
            # Send OTP
            success, message = send_whatsapp_otp(phone_number)
            
            if success:
                return Response({"message": "OTP sent successfully via WhatsApp"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(views.APIView):
    permission_classes = []

    def post(self, request):
        serializer = OTPConfirmationSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            
            # Mark as verified
            user = User.objects.get(phone_number=phone_number)
            verification = user.phone_verification
            verification.is_verified = True
            verification.save()
            
            # Update phone verification status (NOT identity verification)
            user.is_phone_verified = True
            user.save()
            
            # Generate new tokens with updated user data
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "Phone verified successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
