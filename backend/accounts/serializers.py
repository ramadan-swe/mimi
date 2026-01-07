from rest_framework import serializers
from django.contrib.auth import get_user_model
from notifications.models import PhoneVerification
from django.utils import timezone

User = get_user_model()

class PhoneVerificationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)

    def validate_phone_number(self, value):
        import re
        # Remove spaces, dashes, or parentheses
        clean_value = re.sub(r'[\s\-\(\)]', '', value)

        # Regex for Egyptian phone numbers:
        # Accepts: +201xxxxxxxxx, 201xxxxxxxxx, or 01xxxxxxxxx
        # Must start with 10, 11, 12, or 15
        egypt_pattern = r'^(?:\+20|20)?(1[0125]\d{8})$|^0(1[0125]\d{8})$'
        
        match = re.match(egypt_pattern, clean_value)
        if not match:
            raise serializers.ValidationError("Invalid Egyptian phone number. Must start with 010, 011, 012, or 015.")

        # Normalize to E.164 format (+20...)
        # Extract the core mobile number (e.g., 10xxxxxxxx) from the capture groups
        core_number = match.group(1) or match.group(2)
        return f"+20{core_number}"

class OTPConfirmationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    otp_code = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        otp_code = attrs.get('otp_code')

        try:
            user = User.objects.get(phone_number=phone_number)
            verification = user.phone_verification
        except (User.DoesNotExist, PhoneVerification.DoesNotExist):
            raise serializers.ValidationError("Invalid phone number or no verification pending.")

        if verification.otp_code != otp_code:
            raise serializers.ValidationError("Invalid OTP code.")

        if timezone.now() > verification.expires_at:
            raise serializers.ValidationError("OTP code expired.")
            
        return attrs
