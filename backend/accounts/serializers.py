from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from notifications.models import PhoneVerification
from django.utils import timezone

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that accepts email (since USERNAME_FIELD is 'email')
    """
    username_field = 'email'  # Use email as the username field
    
    def validate(self, attrs):
        # Map 'email' to 'username' if provided (for compatibility)
        if 'email' in attrs and 'username' not in attrs:
            attrs['username'] = attrs['email']
        return super().validate(attrs)
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['email'] = user.email
        token['is_verified_identity'] = user.is_verified_identity
        token['full_name'] = user.get_full_name()
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['waseet_score'] = user.waseet_score

        return token


class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    phone_number = serializers.CharField(required=True, max_length=15)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("user with this email already exists.")
        return value.lower()

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("user with this phone number already exists.")
        return value

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        instance.set_password(validated_data['password'])
        instance.role = 'RENTER'
        instance.is_verified_identity = False
        instance.waseet_score = 0
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('phone_number', )


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
