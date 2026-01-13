from rest_framework import serializers
from .models import Vehicle, Listing, ListingImage, RentalRequest, Availability
from accounts.models import User
from datetime import timedelta
from decimal import Decimal


class OwnerSerializer(serializers.ModelSerializer):
    """Serializer for listing owner details"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'waseet_score']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add a combined name field
        data['name'] = f"{instance.first_name} {instance.last_name}".strip() or "Host"
        return data


class VehicleSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles without nested data"""
    class Meta:
        model = Vehicle
        exclude = ('owner', 'created_at', 'updated_at')


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image', 'image_type', 'order']


class ListingImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['image', 'image_type', 'order']


class ListingSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at', 'status', 'is_featured', 'featured_until', 'embedding', 'latitude', 'longitude')


class ListingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating listings with vehicle data"""
    vehicle_data = VehicleCreateSerializer(write_only=True)

    class Meta:
        model = Listing
        exclude = ('owner', 'status', 'is_featured', 'featured_until', 'embedding', 'created_at', 'updated_at')

    def create(self, validated_data):
        vehicle_data = validated_data.pop('vehicle_data')
        owner = self.context['request'].user
        
        # Create vehicle
        vehicle = Vehicle.objects.create(owner=owner, **vehicle_data)
        
        # Create listing
        listing = Listing.objects.create(vehicle=vehicle, owner=owner, **validated_data)
        return listing


class ListingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating listings (pricing, location, etc.)"""
    class Meta:
        model = Listing
        fields = ['title', 'daily_price', 'weekly_discount', 'monthly_discount', 
                  'seasonal_pricing_config', 'governorate', 'city', 'latitude', 'longitude']
        read_only_fields = []


class AvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for listing availability periods"""
    class Meta:
        model = Availability
        fields = ['id', 'date_start', 'date_end', 'is_available']


class RentalRequestSerializer(serializers.ModelSerializer):
    """Serializer for rental requests"""
    listing_details = ListingSerializer(source='listing', read_only=True)
    renter_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RentalRequest
        fields = ['id', 'listing', 'listing_details', 'renter', 'renter_name', 
                  'start_date', 'end_date', 'total_price', 'status',
                  'renter_confirmed', 'owner_confirmed', 'created_at', 'updated_at']
        read_only_fields = ['renter', 'renter_name', 'total_price', 'status', 
                           'renter_confirmed', 'owner_confirmed', 'created_at', 'updated_at']
    
    def get_renter_name(self, obj):
        return f"{obj.renter.first_name} {obj.renter.last_name}".strip() or "Renter"


class RentalRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating rental requests"""
    class Meta:
        model = RentalRequest
        fields = ['listing', 'start_date', 'end_date']
    
    def validate(self, data):
        listing = data['listing']
        start_date = data['start_date']
        end_date = data['end_date']
        renter = self.context['request'].user
        
        # Validate dates (allow same day for 1-day rental)
        if start_date > end_date:
            raise serializers.ValidationError("End date cannot be before start date")
        
        # Check if user already has a pending request for same listing and dates
        existing_pending = RentalRequest.objects.filter(
            listing=listing,
            renter=renter,
            status='PENDING',
            start_date=start_date,
            end_date=end_date
        ).exists()
        
        if existing_pending:
            raise serializers.ValidationError("You already have a pending request for these dates")
        
        # Check for overlapping ACCEPTED rentals only (allow multiple pending requests)
        overlapping = RentalRequest.objects.filter(
            listing=listing,
            status='ACCEPTED',
            start_date__lte=end_date,
            end_date__gte=start_date
        ).exists()
        
        if overlapping:
            raise serializers.ValidationError("These dates overlap with an accepted rental")
        
        # Check availability periods (if any are set)
        availability_periods = Availability.objects.filter(listing=listing)
        if availability_periods.exists():
            # Check if requested dates fall within available periods
            is_available = Availability.objects.filter(
                listing=listing,
                is_available=True,
                date_start__lte=start_date,
                date_end__gte=end_date
            ).exists()
            
            if not is_available:
                raise serializers.ValidationError("The selected dates are not available for this listing")
        
        return data
    
    def create(self, validated_data):
        listing = validated_data['listing']
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
        
        # Calculate total price (inclusive day count - both start and end date)
        num_days = (end_date - start_date).days + 1
        daily_price = listing.daily_price
        
        # Apply weekly discount if applicable
        if num_days >= 7 and listing.weekly_discount:
            discount = Decimal(listing.weekly_discount) / 100
            total_price = daily_price * num_days * (1 - discount)
        elif num_days >= 30 and listing.monthly_discount:
            discount = Decimal(listing.monthly_discount) / 100
            total_price = daily_price * num_days * (1 - discount)
        else:
            total_price = daily_price * num_days
        
        rental_request = RentalRequest.objects.create(
            renter=self.context['request'].user,
            listing=listing,
            start_date=start_date,
            end_date=end_date,
            total_price=total_price
        )
        
        return rental_request
