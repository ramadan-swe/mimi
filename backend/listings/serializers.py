from rest_framework import serializers
from .models import Listing, ListingImage

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
    images = ListingImageSerializer(many=True, read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at', 'status', 'is_featured', 'featured_until', 'embedding', 'latitude', 'longitude')
