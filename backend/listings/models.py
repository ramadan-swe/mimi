from django.db import models
from accounts.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from pgvector.django import VectorField


class TransmissionType(models.TextChoices):
    MANUAL = 'MANUAL', 'Manual'
    AUTOMATIC = 'AUTOMATIC', 'Automatic'


class FuelType(models.TextChoices):
    BENZINE = 'BENZINE', 'Benzine'
    ELECTRIC = 'ELECTRIC', 'Electric'
    HYBRID = 'HYBRID', 'Hybrid'


class SeatCount(models.IntegerChoices):
    FOUR = 4, '4 Seats'
    FIVE = 5, '5 Seats'
    SIX = 6, '6 Seats'
    SEVEN = 7, '7 Seats'


class DoorCount(models.IntegerChoices):
    TWO = 2, '2 Doors'
    THREE = 3, '3 Doors'
    FOUR = 4, '4 Doors'


class Category(models.TextChoices):
    BASE = 'BASE', 'Base Line'
    MID = 'MID', 'Mid Line'
    HIGH = 'HIGH', 'High Line'
    TOP = 'TOP', 'Top Line'
    PREMIUM = 'PREMIUM', 'Premium'


class MileageRange(models.TextChoices):
    RANGE_0_15K = '0-15K', '0-15,000 KM'
    RANGE_15_30K = '15-30K', '15,000-30,000 KM'
    RANGE_30_60K = '30-60K', '30,000-60,000 KM'
    RANGE_60_90K = '60-90K', '60,000-90,000 KM'
    RANGE_90_120K = '90-120K', '90,000-120,000 KM'
    RANGE_120_150K = '120-150K', '120,000-150,000 KM'
    RANGE_150K_PLUS = '150K+', '> 150,000 KM'


class ListingStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    HIDDEN = 'HIDDEN', 'Hidden'
    BANNED = 'BANNED', 'Banned'


class ImageType(models.TextChoices):
    MAIN = 'MAIN', 'Main'
    FRONT = 'FRONT', 'Front'
    BACK = 'BACK', 'Back'
    LEFT = 'LEFT', 'Left'
    RIGHT = 'RIGHT', 'Right'
    INTERIOR = 'INTERIOR', 'Interior'


class RentalRequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    REJECTED = 'REJECTED', 'Rejected'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class Governorate(models.TextChoices):
    CAIRO = 'Cairo', 'Cairo'
    ALEXANDRIA = 'Alexandria', 'Alexandria'
    GIZA = 'Giza', 'Giza'
    DAKAHLIA = 'Dakahlia', 'Dakahlia'
    RED_SEA = 'Red Sea', 'Red Sea'
    BEHEIRA = 'Beheira', 'Beheira'
    FAYOUM = 'Fayoum', 'Fayoum'
    GHARBIA = 'Gharbia', 'Gharbia'
    ISMAILIA = 'Ismailia', 'Ismailia'
    MONUFIA = 'Monufia', 'Monufia'
    MINYA = 'Minya', 'Minya'
    QALYUBIA = 'Qalyubia', 'Qalyubia'
    NEW_VALLEY = 'New Valley', 'New Valley'
    SUEZ = 'Suez', 'Suez'
    ASWAN = 'Aswan', 'Aswan'
    ASSIUT = 'Assiut', 'Assiut'
    BENI_SUEF = 'Beni Suef', 'Beni Suef'
    PORT_SAID = 'Port Said', 'Port Said'
    DAMIETTA = 'Damietta', 'Damietta'
    SHARKIA = 'Sharkia', 'Sharkia'
    SOUTH_SINAI = 'South Sinai', 'South Sinai'
    KAFR_AL_SHEIKH = 'Kafr Al-Sheikh', 'Kafr Al-Sheikh'
    MATROUH = 'Matrouh', 'Matrouh'
    LUXOR = 'Luxor', 'Luxor'
    QENA = 'Qena', 'Qena'
    NORTH_SINAI = 'North Sinai', 'North Sinai'
    SOHAG = 'Sohag', 'Sohag'


class Vehicle(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    brand = models.CharField(max_length=50) # e.g., Toyota, Hyundai, Nissan
    model = models.CharField(max_length=50)
    year = models.IntegerField(validators=[MinValueValidator(1990), MaxValueValidator(2025)])
    transmission = models.CharField(max_length=10, choices=TransmissionType.choices)
    fuel_type = models.CharField(max_length=10, choices=FuelType.choices)
    seats = models.IntegerField(choices=SeatCount.choices)
    doors = models.IntegerField(choices=DoorCount.choices)
    color = models.CharField(max_length=30)
    category = models.CharField(max_length=20, choices=Category.choices)
    mileage_range = models.CharField(max_length=20, choices=MileageRange.choices)
    is_insured = models.BooleanField(default=False)
    extras = models.JSONField(default=dict, blank=True, null=True) # Boolean dict for: {"AC": true, "GPS": false, "Bluetooth": true, "Cruise_Control": false, "Parking_Sensor": true, "Rear_Camera": false, "Baby_Seat": false}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.year} {self.brand} {self.model}"


class Listing(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='listings')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=200)
    daily_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    weekly_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]) # Percentage
    monthly_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]) # Percentage
    seasonal_pricing_config = models.JSONField(default=dict, blank=True, null=True) # Future use: {"from": "2024-06-01", "to": "2024-08-31", "increase_pct": 20}
    is_featured = models.BooleanField(default=False) # Low priority
    featured_until = models.DateTimeField(null=True, blank=True)
    governorate = models.CharField(max_length=50, choices=Governorate.choices) # Cairo, Alexandria, Giza, etc. (27 total)
    city = models.CharField(max_length=50)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=10, choices=ListingStatus.choices, default=ListingStatus.ACTIVE, db_index=True)
    embedding = VectorField(dimensions=1536, null=True, blank=True) # Using pgvector extension for AI search
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='vehicles/%Y/%m/')
    image_type = models.CharField(max_length=10, choices=ImageType.choices)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        constraints = [
            models.UniqueConstraint(fields=['vehicle', 'image_type'], name='unique_vehicle_image_type')
        ]


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listings/%Y/%m/')
    image_type = models.CharField(max_length=10, choices=ImageType.choices)
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
    status = models.CharField(max_length=15, choices=RentalRequestStatus.choices, default=RentalRequestStatus.PENDING, db_index=True)
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

