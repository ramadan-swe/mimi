from rest_framework import serializers
from .models import Vehicle, VehicleImage, Listing, ListingImage


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image', 'image_type', 'order']


class VehicleSerializer(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)
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
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
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
