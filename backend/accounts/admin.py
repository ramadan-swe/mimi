from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class UserAdmin(UserAdmin):
    list_display=['email', 'phone_number', 'username', 'role', 'is_verified_identity', 'waseet_score', 'active_subscription']
    search_fields=['email', 'phone_number', 'username']
    list_filter=['role', 'is_verified_identity']
    readonly_fields = ['active_subscription']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': (
            'phone_number', 'role', 'is_verified_identity', 'waseet_score', 'national_id_hash', 'commercial_register',
            'active_subscription',
            )}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': (
            'phone_number', 'role', 'is_verified_identity', 'waseet_score', 'national_id_hash', 'commercial_register',
            'active_subscription',
            )}),
    )