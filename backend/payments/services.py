from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .adapters import PaymobSubscriptionAdapter
from .models import Subscription, UserSubscription, PaymentTransaction

class SubscriptionService:
    def __init__(self):
        self.adapter = PaymobSubscriptionAdapter()

    def sync_plans_to_paymob(self):
        plans = Subscription.objects.filter(gateway_plan_id__isnull=True)
        for plan in plans:
            try:
                res = self.adapter.create_plan(plan.name, plan.price, plan.period)
                plan.gateway_plan_id = str(res.get('id'))
                plan.save()
                print(f"Synced {plan.name} with ID {plan.gateway_plan_id}")
            except Exception as e:
                print(f"Sync error for {plan.name}: {e}")

    def initialize_subscription(self, user, subscription):
        if not subscription.gateway_plan_id:
            self.sync_plans_to_paymob()

        transaction = PaymentTransaction.objects.create(
            user=user, subscription=subscription, amount=subscription.price
        )

        res = self.adapter.create_intention(user, subscription, transaction.id)
        transaction.gateway_order_id = str(res.get('id'))
        transaction.metadata['client_secret'] = res.get('client_secret')
        transaction.save()

        iframe_url = f"https://accept.paymob.com/unifiedcheckout/?publicKey={settings.PAYMOB_PUBLIC_KEY}&clientSecret={res.get('client_secret')}"
        return iframe_url, transaction

    def manage_subscription(self, user, action):
        user_sub = UserSubscription.objects.get(user=user)
        try:
            self.adapter.manage_subscription(user_sub.gateway_subscription_id, action)
        except Exception as e:
            print(f"Paymob management error: {e}")

        status_map = {'suspend': 'PAUSED', 'resume': 'ACTIVE', 'cancel': 'CANCELLED'}
        user_sub.status = status_map.get(action)
        if action == 'cancel': user_sub.cancelled_at = timezone.now()
        user_sub.save()
        return user_sub