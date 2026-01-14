from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from .models import Subscription, PaymentTransaction, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer
from .services import SubscriptionService
from accounts.models import User

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_subscription(request):
    user_subscription = UserSubscription.objects.filter(
        user=request.user, status='ACTIVE'
    ).first()
    if not user_subscription:
        return Response({"detail": "No active subscription found."}, status=404)
    return Response(UserSubscriptionSerializer(user_subscription).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_plan(request):
    plan_id = request.data.get('plan_id')
    sub_tier = get_object_or_404(Subscription, id=plan_id)
    try:
        url, tx = SubscriptionService().initialize_subscription(request.user, sub_tier)
        return Response({"payment_url": url, "transaction_id": tx.id})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_subscription_api(request):
    action = request.data.get('action') # suspend, resume, cancel
    try:
        sub = SubscriptionService().manage_subscription(request.user, action)
        return Response({"status": sub.status})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def paymob_unified_webhook(request):
    data = request.data
    event_type = data.get('type')
    trigger_type = data.get('trigger_type')

    # FORMAT A: Standard Transaction (The Money)
    if event_type == "TRANSACTION":
        obj = data.get('obj', {})
        if obj.get('success') is True:
            django_tx_id = obj.get('payment_key_claims', {}).get('extra', {}).get('merchant_order_id')
            intention_id = obj.get('payment_key_claims', {}).get('next_payment_intention')
            
            tx = PaymentTransaction.objects.filter(id=django_tx_id).first()
            if not tx:
                tx = PaymentTransaction.objects.filter(gateway_order_id=intention_id).first()

            if tx:
                tx.status = 'SUCCESS'
                tx.completed_at = timezone.now()
                tx.gateway_transaction_id = str(obj.get('id'))
                tx.save()
                activate_user_logic(obj, obj.get('payment_key_claims', {}).get('subscription_plan_id'), tx.user)

    # FORMAT B: Subscription Module (The Schedule)
    elif trigger_type == "Subscription Created" or "subscription_data" in data:
        sub_data = data.get('subscription_data', {})
        email = sub_data.get('client_info', {}).get('email')
        try:
            user = User.objects.get(email__iexact=email.strip().lower())
            activate_user_logic(sub_data, sub_data.get('plan_id'), user)
        except Exception as e:
            print(f"Sub Module Webhook Error: {e}")

    return Response(status=200)

def activate_user_logic(data_source, plan_id, user):
    plan = Subscription.objects.get(gateway_plan_id=str(plan_id))
    # Detect if we have the Sub ID from the Subscription Module payload
    gateway_sub_id = str(data_source.get('id')) if 'client_info' in data_source else None
    
    user_sub, created = UserSubscription.objects.update_or_create(
        user=user,
        defaults={
            'subscription': plan, 'status': 'ACTIVE',
            'current_period_start': timezone.now(),
            'current_period_end': timezone.now() + timedelta(days=30)
        }
    )
    if gateway_sub_id:
        user_sub.gateway_subscription_id = gateway_sub_id
        user_sub.save()