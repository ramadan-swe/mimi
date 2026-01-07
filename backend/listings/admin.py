from django.contrib import admin

from .models import Vehicle, VehicleImage, Listing, ListingImage, RentalRequest, Review


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'owner', 'brand', 'model', 'year', 'transmission', 'fuel_type', 'seats']
    search_fields = ['brand', 'model', 'owner__email']
    list_filter = ['transmission', 'fuel_type', 'category', 'year']


class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 1


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'get_brand', 'get_model', 'daily_price', 'status']
    search_fields = ['title', 'vehicle__brand', 'vehicle__model', 'owner__email']
    list_filter = ['status', 'governorate', 'vehicle__transmission']
    
    def get_brand(self, obj):
        return obj.vehicle.brand
    get_brand.short_description = 'Brand'
    get_brand.admin_order_field = 'vehicle__brand'
    
    def get_model(self, obj):
        return obj.vehicle.model
    get_model.short_description = 'Model'
    get_model.admin_order_field = 'vehicle__model'

@admin.register(RentalRequest)
class RentalRequestAdmin(admin.ModelAdmin):
    list_display=['renter', 'listing', 'status', 'start_date', 'end_date']
    list_filter=['status']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display=['transaction', 'reviewer', 'rating', 'created_at']
