from django.contrib import admin
from .models import Subscription, PaymentTransaction, UserSubscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'max_listings']
    search_fields = ['name']


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subscription', 'amount', 'status', 'gateway', 'created_at']
    list_filter = ['status', 'gateway', 'created_at', 'subscription']
    search_fields = ['user__email', 'gateway_transaction_id', 'gateway_order_id']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subscription', 'status', 'current_period_end', 'created_at']
    list_filter = ['status', 'gateway', 'created_at', 'subscription']
    search_fields = ['user__email', 'gateway_subscription_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


