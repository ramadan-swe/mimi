from django.contrib import admin

from .models import Notification, PhoneVerification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display=['user', 'type', 'title', 'is_read', 'created_at']
    list_filter=['type', 'is_read']

@admin.register(PhoneVerification)
class PhoneVerificationAdmin(admin.ModelAdmin):
    list_display=['user', 'otp_code', 'is_verified', 'expires_at']
