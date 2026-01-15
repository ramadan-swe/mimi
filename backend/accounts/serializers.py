from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from notifications.models import PhoneVerification
from django.utils import timezone
from payments.models import Subscription, UserSubscription
import re

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

        token['id'] = user.id
        token['user_id'] = user.id
        token['role'] = user.role
        token['email'] = user.email
        token['is_phone_verified'] = user.is_phone_verified
        token['is_verified_identity'] = user.is_verified_identity
        token['full_name'] = user.get_full_name()
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['waseet_score'] = user.waseet_score

        return token


class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(
        required=True, 
        max_length=150,
        min_length=2
    )
    last_name = serializers.CharField(
        required=True, 
        max_length=150,
        min_length=2
    )
    phone_number = serializers.CharField(
        required=True, 
        max_length=20
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'password')

    def validate_email(self, value):
        """Validate email format and uniqueness"""
        # Strip whitespace
        value = value.strip()
        
        # Basic email format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, value):
            raise serializers.ValidationError(
                "Please enter a valid email address."
            )
        
        # Check uniqueness (case-insensitive)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email address already exists."
            )
        
        return value.lower()

    def validate_first_name(self, value):
        """Validate first name contains only letters and spaces"""
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError("First name is required.")
        
        # Allow letters (including Arabic), spaces, hyphens, and apostrophes
        if not re.match(r"^[a-zA-Z\u0600-\u06FF\s'-]+$", value):
            raise serializers.ValidationError(
                "First name can only contain letters, spaces, hyphens, and apostrophes."
            )
        
        return value.title()  # Capitalize properly

    def validate_last_name(self, value):
        """Validate last name contains only letters and spaces"""
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError("Last name is required.")
        
        # Allow letters (including Arabic), spaces, hyphens, and apostrophes
        if not re.match(r"^[a-zA-Z\u0600-\u06FF\s'-]+$", value):
            raise serializers.ValidationError(
                "Last name can only contain letters, spaces, hyphens, and apostrophes."
            )
        
        return value.title()  # Capitalize properly

    def validate_phone_number(self, value):
        """Validate international phone number format and uniqueness"""
        # Remove spaces, dashes, or parentheses
        clean_value = re.sub(r'[\s\-\(\)]', '', value)

        # International phone number validation
        # Must start with + and country code, or just digits
        # Length: 7-15 digits (international standard)
        if clean_value.startswith('+'):
            # Format: +[country code][number]
            if not re.match(r'^\+\d{7,15}$', clean_value):
                raise serializers.ValidationError(
                    "Please enter a valid phone number in international format (e.g., +1234567890)."
                )
            normalized_phone = clean_value
        else:
            # If no +, validate it's just digits and has reasonable length
            if not re.match(r'^\d{7,15}$', clean_value):
                raise serializers.ValidationError(
                    "Please enter a valid phone number (7-15 digits)."
                )
            # Add + prefix if not present
            normalized_phone = f"+{clean_value}"
        
        # Check uniqueness
        if User.objects.filter(phone_number=normalized_phone).exists():
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )
        
        return normalized_phone

    def create(self, validated_data):
        from decimal import Decimal
        from datetime import timedelta
        # Get or create Free subscription
        subscription, _ = Subscription.objects.get_or_create(
            name='Free',
            defaults={
                'max_listings': 3,
                'price': Decimal('0.00'),
                'period': 'MONTHLY',
                'features': {},
            }
        )
        instance = self.Meta.model(**validated_data)
        instance.set_password(validated_data['password'])
        instance.role = 'RENTER'
        instance.is_verified_identity = False
        instance.waseet_score = 0
        instance.save()
        # Create subscription after user is saved with period dates
        now = timezone.now()
        user_subscription = UserSubscription.objects.create(
            user=instance,
            subscription=subscription,
            current_period_start=now,
            current_period_end=now + timedelta(days=60)  # 60 days for monthly
        )
        instance.active_subscription = user_subscription
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'is_phone_verified', 'is_verified_identity', 'waseet_score')
        read_only_fields = ('id', 'is_phone_verified', 'is_verified_identity', 'waseet_score')

    def update(self, instance, validated_data):
        # If phone number is being changed, reset verification status
        new_phone = validated_data.get('phone_number')
        if new_phone and new_phone != instance.phone_number:
            instance.is_phone_verified = False
        return super().update(instance, validated_data)


class PhoneVerificationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)

    def validate_phone_number(self, value):
        # Remove spaces, dashes, or parentheses
        clean_value = re.sub(r'[\s\-\(\)]', '', value)

        # International phone number validation
        if clean_value.startswith('+'):
            if not re.match(r'^\+\d{7,15}$', clean_value):
                raise serializers.ValidationError(
                    "Please enter a valid phone number in international format (e.g., +1234567890)."
                )
            normalized_phone = clean_value
        else:
            if not re.match(r'^\d{7,15}$', clean_value):
                raise serializers.ValidationError(
                    "Please enter a valid phone number (7-15 digits)."
                )
            normalized_phone = f"+{clean_value}"
        
        return normalized_phone


class OTPConfirmationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    otp_code = serializers.CharField(max_length=6, min_length=6)

    def validate_otp_code(self, value):
        """Validate OTP code format"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP code must contain only digits.")
        return value

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        otp_code = attrs.get('otp_code')

        try:
            user = User.objects.get(phone_number=phone_number)
            verification = user.phone_verification
        except (User.DoesNotExist, PhoneVerification.DoesNotExist):
            raise serializers.ValidationError(
                "No verification request found for this phone number."
            )

        if verification.otp_code != otp_code:
            raise serializers.ValidationError(
                "The OTP code you entered is incorrect. Please try again."
            )

        if timezone.now() > verification.expires_at:
            raise serializers.ValidationError(
                "This OTP code has expired. Please request a new one."
            )
            
        return attrs


class PublicUserSerializer(serializers.ModelSerializer):
    """Serializer for public user profile (limited info)"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'waseet_score', 'date_joined']
        read_only_fields = fields


class IDVerificationSerializer(serializers.ModelSerializer):
    """Serializer for ID verification submission"""
    from .models import IDVerification
    
    class Meta:
        from .models import IDVerification
        model = IDVerification
        fields = ['id', 'national_id_image_front', 'national_id_image_back', 'driver_license_image', 
                  'is_verified', 'verification_date', 'verification_notes']
        read_only_fields = ['id', 'is_verified', 'verification_date', 'verification_notes']
    
    def create(self, validated_data):
        from .models import IDVerification
        user = self.context['request'].user
        # Check if user already has a verification request
        existing = IDVerification.objects.filter(user=user).first()
        if existing:
            # Update existing verification
            for key, value in validated_data.items():
                setattr(existing, key, value)
            existing.is_verified = False  # Reset verification status
            existing.save()
            return existing
        # Create new verification
        return IDVerification.objects.create(user=user, **validated_data)


class IDVerificationStatusSerializer(serializers.ModelSerializer):
    """Serializer for checking ID verification status"""
    from .models import IDVerification
    
    class Meta:
        from .models import IDVerification
        model = IDVerification
        fields = ['is_verified', 'verification_date', 'verification_notes']
        read_only_fields = fields
