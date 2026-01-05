from django.db import models
from accounts.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from pgvector.django import VectorField





EGYPT_GOVERNORATES_CHOICES = [
    ('Cairo', 'Cairo'),
    ('Alexandria', 'Alexandria'),
    ('Giza', 'Giza'),
    ('Dakahlia', 'Dakahlia'),
    ('Red Sea', 'Red Sea'),
    ('Beheira', 'Beheira'),
    ('Fayoum', 'Fayoum'),
    ('Gharbia', 'Gharbia'),
    ('Ismailia', 'Ismailia'),
    ('Monufia', 'Monufia'),
    ('Minya', 'Minya'),
    ('Qalyubia', 'Qalyubia'),
    ('New Valley', 'New Valley'),
    ('Suez', 'Suez'),
    ('Aswan', 'Aswan'),
    ('Assiut', 'Assiut'),
    ('Beni Suef', 'Beni Suef'),
    ('Port Said', 'Port Said'),
    ('Damietta', 'Damietta'),
    ('Sharkia', 'Sharkia'),
    ('South Sinai', 'South Sinai'),
    ('Kafr Al-Sheikh', 'Kafr Al-Sheikh'),
    ('Matrouh', 'Matrouh'),
    ('Luxor', 'Luxor'),
    ('Qena', 'Qena'),
    ('North Sinai', 'North Sinai'),
    ('Sohag', 'Sohag'),
]

class Listing(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=200)
    brand = models.CharField(max_length=50) # e.g., Toyota, Hyundai, Nissan
    model = models.CharField(max_length=50)
    year = models.IntegerField(validators=[MinValueValidator(1990), MaxValueValidator(2025)])
    transmission = models.CharField(max_length=10, choices=[('MANUAL', 'Manual'), ('AUTOMATIC', 'Automatic')])
    fuel_type = models.CharField(max_length=10, choices=[('BENZINE', 'Benzine'), ('ELECTRIC', 'Electric'), ('HYBRID', 'Hybrid')])
    seats = models.IntegerField(choices=[(4, '4 Seats'), (5, '5 Seats'), (6, '6 Seats'), (7, '7 Seats')])
    doors = models.IntegerField(choices=[(2, '2 Doors'), (3, '3 Doors'), (4, '4 Doors')])
    color = models.CharField(max_length=30)
    category = models.CharField(max_length=20, choices=[('BASE', 'Base Line'), ('MID', 'Mid Line'), ('HIGH', 'High Line'), ('TOP', 'Top Line'), ('PREMIUM', 'Premium')])
    mileage_range = models.CharField(max_length=20, choices=[('0-15K', '0-15,000 KM'), ('15-30K', '15,000-30,000 KM'), ('30-60K', '30,000-60,000 KM'), ('60-90K', '60,000-90,000 KM'), ('90-120K', '90,000-120,000 KM'), ('120-150K', '120,000-150,000 KM'), ('150K+', '> 150,000 KM')])
    is_insured = models.BooleanField(default=False)
    extras = models.JSONField(default=dict, blank=True, null=True) # Boolean dict for: {"AC": true, "GPS": false, "Bluetooth": true, "Cruise_Control": false, "Parking_Sensor": true, "Rear_Camera": false, "Baby_Seat": false}
    daily_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    weekly_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]) # Percentage
    monthly_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]) # Percentage
    seasonal_pricing_config = models.JSONField(default=dict, blank=True, null=True) # Future use: {"from": "2024-06-01", "to": "2024-08-31", "increase_pct": 20}
    is_featured = models.BooleanField(default=False) # Low priority
    featured_until = models.DateTimeField(null=True, blank=True)
    governorate = models.CharField(max_length=50, choices=EGYPT_GOVERNORATES_CHOICES) # Cairo, Alexandria, Giza, etc. (27 total)
    city = models.CharField(max_length=50)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=10, choices=[('ACTIVE', 'Active'), ('HIDDEN', 'Hidden'), ('BANNED', 'Banned')], default='ACTIVE', db_index=True) #Enum
    embedding = VectorField(dimensions=1536, null=True, blank=True) # Using pgvector extension for AI search
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listings/%Y/%m/')
    image_type = models.CharField(max_length=10, choices=[('MAIN', 'Main'), ('FRONT', 'Front'), ('BACK', 'Back'), ('LEFT', 'Left'), ('RIGHT', 'Right'), ('INTERIOR', 'Interior')])
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        constraints = [
            models.UniqueConstraint(fields=['listing', 'image_type'], name='unique_listing_image_type')
        ]

class RentalRequest(models.Model):
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rental_requests')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='requests')
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='PENDING', db_index=True)
    renter_confirmed = models.BooleanField(default=False)
    owner_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Review(models.Model):
    transaction = models.ForeignKey(RentalRequest, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['transaction', 'reviewer'], name='unique_review_per_transaction')
        ]


class Availability(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='availability')
    date_start = models.DateField()
    date_end = models.DateField()
    is_available = models.BooleanField(default=True)

