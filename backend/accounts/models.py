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
        return self.active_listings_count < self.active_subscription.subscription.max_listings
    
    @property
    def active_listings_count(self):
        return self.listings.filter(status=ListingStatus.ACTIVE).count()