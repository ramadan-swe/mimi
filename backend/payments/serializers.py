from rest_framework import serializers
from .models import Subscription, UserSubscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'name', 'price', 'max_listings', 'period', 'features']

class UserSubscriptionSerializer(serializers.ModelSerializer):
    # Use IntegerField to safely get the ID without crashing
    subscription = serializers.IntegerField(source='subscription_id', read_only=True)
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = ['id', 'subscription', 'plan_name', 'status', 'current_period_end']

    # This method is much safer than 'source'
    def get_plan_name(self, obj):
        if obj.subscription:
            return obj.subscription.name
        return "Unknown Plan"