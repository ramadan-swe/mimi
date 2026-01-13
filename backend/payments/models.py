from django.db import models
from django.contrib.postgres.fields import JSONField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings


class Subscription(models.Model):
    """Subscription plan/tier definition"""
    
    PERIOD_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('YEARLY', 'Yearly'),
        ('WEEKLY', 'Weekly'),
    ]
    
    name = models.CharField(max_length=50, unique=True) # e.g., "Premium", "Agency"
    max_listings = models.IntegerField() # e.g., 10 for Premium, 50 for Agency
    price = models.DecimalField(max_digits=10, decimal_places=2) # Monthly/yearly price
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='MONTHLY') # Billing period
    features = models.JSONField(default=dict) # Additional tier features
    
    # Gateway-specific plan ID (e.g., Paymob plan ID)
    gateway_plan_id = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.period})"
    
    # @property
    # def price_per_month(self):
    #     """Calculate price per month for display"""
    #     if self.period == 'MONTHLY':
    #         return self.price
    #     elif self.period == 'YEARLY':
    #         return self.price / 12
    #     elif self.period == 'WEEKLY':
    #         return self.price * 4
    #     return self.price


class PaymentTransaction(models.Model):
    """Model to track subscription payment transactions """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]
    
    GATEWAY_CHOICES = [
        ('PAYMOB', 'Paymob'),
        ('STRIPE', 'Stripe'),
        ('PAYPAL', 'PayPal'),
        
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, # our custom user model
        on_delete=models.CASCADE, 
        related_name='payment_transactions'
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL, # if the subscription is deleted, the transaction is not deleted
        null=True,
        related_name='transactions'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='EGP')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING') 
    
    # Gateway fields
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, default='PAYMOB')
    gateway_order_id = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    gateway_transaction_id = models.CharField(max_length=100, null=True, blank=True, unique=True, db_index=True)
    
    # Gateway-specific data stored in metadata (e.g., payment_key, iframe_url, etc.)
    # This allows each adapter to store its own specific fields without model changes
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    
    def __str__(self):
        return f"{self.user.email} - {self.subscription.name if self.subscription else 'N/A'} - {self.status} ({self.gateway})"


class UserSubscription(models.Model):
    """Track active recurring subscriptions for users"""
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
        ('PAST_DUE', 'Past Due'),
        ('PAUSED', 'Paused'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='active_subscription'
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        related_name='user_subscriptions'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Gateway-specific subscription ID
    gateway = models.CharField(max_length=20, choices=PaymentTransaction.GATEWAY_CHOICES, default='PAYMOB')
    gateway_subscription_id = models.CharField(max_length=100, null=True, blank=True, unique=True, db_index=True)
    gateway_token_id = models.CharField(max_length=100, null=True, blank=True)  # For recurring payments (e.g., Stripe token)
    
    # Subscription dates
    started_at = models.DateTimeField(auto_now_add=True)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    cancelled_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata for gateway-specific data
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        # indexes = [
        #     models.Index(fields=['user', 'status']),
        #     models.Index(fields=['gateway_subscription_id']),
        #     models.Index(fields=['current_period_end']),
        # ]
    
    def __str__(self):
        return f"{self.user.email} - {self.subscription.name if self.subscription else 'N/A'} - {self.status}"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        from django.utils import timezone
        return (
            self.status == 'ACTIVE' and
            self.current_period_end > timezone.now() and
            (self.expires_at is None or self.expires_at > timezone.now())
        )
    
    def cancel(self):
        """Cancel the subscription"""
        from django.utils import timezone
        self.status = 'CANCELLED'
        self.cancelled_at = timezone.now()
        self.save()

