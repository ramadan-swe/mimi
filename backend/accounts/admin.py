from django.contrib import admin
from .models import User


from django.utils.html import format_html
from .models import IDVerification



@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display=['username', 'email', 'role', 'is_verified_identity', 'waseet_score']
    search_fields=['username', 'email']
    list_filter=['role', 'is_verified_identity']


@admin.register(IDVerification)
class IDVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'user', 
        'verification_status_display', 
        'verification_date', 
        'verified_by_display'
    ]
    list_filter = ['is_verified', 'verification_date']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['verification_date', 'view_images']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Verification Images', {
            'fields': ('national_id_image_front', 'national_id_image_back', 
                      'driver_license_image', 'view_images')
        }),
        ('Verification Status', {
            'fields': ('is_verified', 'verification_date', 'verification_by', 
                      'verification_notes')
        }),
    )
    
    def verification_status_display(self, obj):
        """Display verification status with colors"""
        if obj.is_verified:
            return format_html(
                '<span style="color: green; font-weight: bold;"> Verified</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;"> Not Verified</span>'
        )
    verification_status_display.short_description = "Status"
    
    def verified_by_display(self, obj):
        """Display who verified the user"""
        if obj.verification_by:
            return obj.verification_by.username
        return "—"
    verified_by_display.short_description = "Verified By"
    
    def view_images(self, obj):
        """Display images in detail page"""
        html = ""
        if obj.national_id_image_front:
            html += f'<p><strong>National ID (Front):</strong><br><img src="{obj.national_id_image_front.url}" width="300"/></p>'
        if obj.national_id_image_back:
            html += f'<p><strong>National ID (Back):</strong><br><img src="{obj.national_id_image_back.url}" width="300"/></p>'
        if obj.driver_license_image:
            html += f'<p><strong>Driver License:</strong><br><img src="{obj.driver_license_image.url}" width="300"/></p>'
        return format_html(html) if html else "No images"
    view_images.short_description = "Preview Images"
    
    def save_model(self, request, obj, form, change):
        """Automatically save who verified"""
        if obj.is_verified and not obj.verification_by:
            obj.verification_by = request.user
        super().save_model(request, obj, form, change)






    actions = ['approve_verification', 'reject_verification']
    
    def approve_verification(self, request, queryset):
        """Approve verification requests"""
        updated = queryset.update(
            is_verified=True,
            verification_by=request.user
        )
        self.message_user(request, f'{updated} users verified successfully')
    approve_verification.short_description = "Approve selected verifications"
    
    def reject_verification(self, request, queryset):
        """Reject verification requests"""
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} verifications rejected')
    reject_verification.short_description = "Reject selected verifications"








