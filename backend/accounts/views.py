from rest_framework import views, status
from rest_framework.response import Response
from .serializers import PhoneVerificationSerializer, OTPConfirmationSerializer
from .services import send_whatsapp_otp
from django.contrib.auth import get_user_model

User = get_user_model()

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
            
            # Also update User model if needed
            user.is_verified_identity = True # Or is_phone_verified? 
            # The prompt implied identity verification.
            user.save()
            
            return Response({"message": "Phone verified successfully"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
