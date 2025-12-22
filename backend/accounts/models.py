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