from django.db import models
from accounts.models import User

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=[('RENTAL_REQUEST', 'Rental Request'), ('RENTAL_ACCEPTED', 'Rental Accepted'), ('RENTAL_REJECTED', 'Rental Rejected'), ('SUBSCRIPTION_EXPIRED', 'Subscription Expired')])
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class PhoneVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='phone_verification')
    otp_code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)