from django.db import models

from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import FileField, ForeignKey, BooleanField, IntegerField, CharField

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    is_verified_identity = models.BooleanField(default=False)
    national_id_hash = models.CharField(max_length=64, unique=True, null=True, blank=True, db_index=True)
    waseet_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    commercial_register = models.FileField(upload_to='commercial_registers/', blank=True, null=True)
    role = models.CharField(max_length=10, choices=[('RENTER', 'Renter'), ('OWNER', 'Owner')], default='RENTER')
    current_subscription = models.ForeignKey('payments.Subscription', on_delete=models.SET_NULL, null=True, blank=True, related_name='subscribers')
    is_deleted = models.BooleanField(default=False, db_index=True) # For soft delete (never hard delete users)
    
    def can_create_listing(self):
        return self.active_listings_count < self.current_subscription.max_listings 
    
    @property
    def active_listings_count(self):
        return self.listings.filter(is_deleted=False, status='ACTIVE').count()


class IDVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='id_verification')
    national_id_image_front = models.ImageField(upload_to='national_id_images/front/')
    national_id_image_back = models.ImageField(upload_to='national_id_images/back/')
    driver_license_image = models.ImageField(upload_to='driver_license_images/')
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(auto_now_add=True)
    verification_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_by')
    verification_notes = models.TextField(blank=True, null=True)

    
    def get_verification_status(self):
        """Display verification status clearly"""
        if self.is_verified:
            return " Verified"
        return " Not Verified"
    get_verification_status.short_description = "Verification Status"

