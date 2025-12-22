from django.db import models
from django.contrib.postgres.fields import JSONField
from django.core.validators import MinValueValidator, MaxValueValidator

class Subscription(models.Model):
    name = models.CharField(max_length=50, unique=True) # e.g., "Trial", "Premium", "Agency Silver", "Agency Gold"
    max_listings = models.IntegerField() # e.g., 5 for Trial, 10 for Premium, 20 for Agency Silver, 50 for Agency Gold
    price = models.DecimalField(max_digits=10, decimal_places=2) # e.g., 0 for Trial, 9.99 for Premium, 19.99 for Agency Silver, 49.99 for Agency Gold
    features = models.JSONField(default=dict) # Additional tier features (e.g., {"analytics": true, "priority_support": true})



