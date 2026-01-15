from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import FileField, ForeignKey, BooleanField, IntegerField, CharField
from listings.models import ListingStatus

import uuid


class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    is_phone_verified = models.BooleanField(default=False)
    is_verified_identity = models.BooleanField(default=False)
    national_id_hash = models.CharField(max_length=64, unique=True, null=True, blank=True, db_index=True)
    waseet_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    commercial_register = models.FileField(upload_to='commercial_registers/', blank=True, null=True)
    role = models.CharField(max_length=10, choices=[('RENTER', 'Renter'), ('OWNER', 'Owner')], default='RENTER')
    is_deleted = models.BooleanField(default=False, db_index=True) # For soft delete (never hard delete users)
    
    def can_create_listing(self):
        """Check if user can create more listings based on their subscription"""
        try:
            subscription = self.active_subscription
            if subscription and subscription.subscription:
                return self.active_listings_count < subscription.subscription.max_listings
        except Exception:
            pass
        # If no subscription, allow up to 1 listing (free tier default)
        return self.active_listings_count < 1
    
    @property
    def active_listings_count(self):
        from listings.models import ListingStatus
        return self.listings.filter(status=ListingStatus.ACTIVE).count()


class IDVerification(models.Model):
    """Model for storing identity verification documents"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='id_verification')
    national_id_image_front = models.ImageField(upload_to='national_id_images/front/')
    national_id_image_back = models.ImageField(upload_to='national_id_images/back/')
    driver_license_image = models.ImageField(upload_to='driver_license_images/')
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_users')
    verification_notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'ID Verification'
        verbose_name_plural = 'ID Verifications'

    def __str__(self):
        return f"ID Verification for {self.user.email}"
    
    def get_verification_status(self):
        """Display verification status clearly"""
        if self.is_verified:
            return "✓ Verified"
        return "✗ Pending"
    get_verification_status.short_description = "Verification Status"