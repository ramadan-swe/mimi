from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    ProfileSerializer,
    PhoneVerificationSerializer,
    OTPConfirmationSerializer,
    PublicUserSerializer,
    IDVerificationSerializer,
    IDVerificationStatusSerializer
)
from .services import send_whatsapp_otp
from .models import IDVerification
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        print(f"Registration request data: {request.data}")  # Debug log
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")  # Debug log
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"status": "success", "message": "User registered successfully."},
            status=status.HTTP_201_CREATED
        )


class ProfileView(generics.RetrieveUpdateAPIView):
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


class PublicUserProfileView(generics.RetrieveAPIView):
    """Public user profile view - shows limited info about a user"""
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    lookup_field = 'pk'


class IDVerificationView(views.APIView):
    """Submit ID verification documents"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """Get current verification status"""
        try:
            verification = IDVerification.objects.get(user=request.user)
            serializer = IDVerificationStatusSerializer(verification)
            return Response({
                'has_submitted': True,
                **serializer.data
            })
        except IDVerification.DoesNotExist:
            return Response({
                'has_submitted': False,
                'is_verified': False
            })
    
    def post(self, request):
        """Submit ID verification documents"""
        serializer = IDVerificationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Verification documents submitted successfully. Our team will review them shortly.',
                'status': 'pending'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
