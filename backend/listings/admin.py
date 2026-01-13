from django.contrib import admin
from .models import Vehicle, Listing, ListingImage, RentalRequest, Review


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'owner', 'brand', 'model', 'year', 'transmission', 'fuel_type', 'seats']
    search_fields = ['brand', 'model', 'owner__email']


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'get_owner', 'get_brand', 'get_model', 'daily_price', 'status']
    search_fields = ['title', 'vehicle__brand', 'vehicle__model', 'owner__email']
    list_filter = ['status', 'governorate']

    def get_owner(self, obj):
        return obj.vehicle.owner if obj.vehicle else None
    get_owner.short_description = 'Owner'

    def get_brand(self, obj):
        return obj.vehicle.brand if obj.vehicle else None
    get_brand.short_description = 'Brand'

    def get_model(self, obj):
        return obj.vehicle.model if obj.vehicle else None
    get_model.short_description = 'Model'


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'listing', 'image']


@admin.register(RentalRequest)
class RentalRequestAdmin(admin.ModelAdmin):
    list_display = ['renter', 'listing', 'status', 'start_date', 'end_date']
    list_filter = ['status']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['transaction', 'reviewer', 'rating', 'created_at']