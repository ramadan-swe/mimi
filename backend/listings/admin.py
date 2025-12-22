from django.contrib import admin

from .models import Listing, RentalRequest, Review


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display=['title', 'owner', 'brand', 'model', 'daily_price', 'status']
    search_fields=['title', 'brand', 'model']
    list_filter=['status', 'governorate', 'transmission']

@admin.register(RentalRequest)
class RentalRequestAdmin(admin.ModelAdmin):
    list_display=['renter', 'listing', 'status', 'start_date', 'end_date']
    list_filter=['status']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display=['transaction', 'reviewer', 'rating', 'created_at']
