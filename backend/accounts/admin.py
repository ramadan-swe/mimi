from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display=['username', 'email', 'role', 'is_verified_identity', 'waseet_score']
    search_fields=['username', 'email']
    list_filter=['role', 'is_verified_identity']

 