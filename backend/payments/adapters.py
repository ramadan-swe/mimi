import requests
from django.conf import settings
from decimal import Decimal

class PaymobSubscriptionAdapter:
    def __init__(self):
        self.base_url = "https://accept.paymob.com/api"
        self.api_key = settings.PAYMOB_API_KEY
        self.secret_key = settings.PAYMOB_SECRET_KEY
        # 3DS ID (5443136) for initial checkout
        self.integration_id = settings.PAYMOB_INTEGRATION_ID 
        # MOTO ID (5469071) for renewals and management
        self.moto_id = settings.PAYMOB_MOTO_INTEGRATION_ID 

    def _get_auth_token(self):
        res = requests.post(f"{self.base_url}/auth/tokens", json={"api_key": self.api_key})
        res.raise_for_status()
        return res.json().get('token')

    def create_plan(self, name: str, amount: Decimal, period: str):
            token = self._get_auth_token()
            url = f"{self.base_url}/acceptance/subscription-plans"
            freq = {'WEEKLY': 7, 'MONTHLY': 30, 'YEARLY': 365}.get(period, 30)
            
            payload = {
                "frequency": freq, 
                "name": name, 
                "plan_type": "rent",
                "amount_cents": int(amount * 100), 
                "is_active": True,
                "integration": self.moto_id, 
                "webhook_url": settings.PAYMOB_WEBHOOK_URL # <--- This uses the setting
            }
            res = requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
            res.raise_for_status()
            return res.json()

    def create_intention(self, user, subscription, transaction_id):
        """Start checkout using the 3DS ID"""
        url = "https://accept.paymob.com/v1/intention/"
        headers = {"Authorization": f"Token {self.secret_key}"}
        payload = {
            "amount": int(subscription.price * 100),
            "currency": "EGP",
            "payment_methods": [self.integration_id], # CRITICAL: USE 3DS ID
            "subscription_plan_id": int(subscription.gateway_plan_id),
            "special_reference": str(transaction_id),
            "redirection_url": settings.FRONTEND_URL + "/subscription/current/",
            "billing_data": {
                "first_name": user.first_name or "User",
                "last_name": user.last_name or "Guest",
                "phone_number": user.phone_number or "+201000000000",
                "email": user.email,
                "city": "Cairo", "country": "EG", "street": "NA", "building": "NA", "apartment": "NA", "floor": "NA", "state": "NA"
            }
        }
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        return res.json()

    def manage_subscription(self, gateway_sub_id, action):
        """Cancel/Suspend using MOTO Token"""
        token = self._get_auth_token()
        url = f"{self.base_url}/acceptance/subscriptions/{gateway_sub_id}/{action}"
        # Some Paymob versions require a slash at the end, some don't. 
        # If you get a 404, remove the trailing slash.
        res = requests.post(url, json={}, headers={"Authorization": f"Bearer {token}"})
        res.raise_for_status()
        return res.json()