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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_plan(request):
    plan_id = request.data.get('plan_id')
    sub_tier = get_object_or_404(Subscription, id=plan_id)
    service = SubscriptionService()
    try:
        url, tx = service.initialize_subscription(request.user, sub_tier)
        return Response({"payment_url": url, "transaction_id": tx.id})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_subscription_api(request):
    action = request.data.get('action') # suspend, resume, cancel
    service = SubscriptionService()
    try:
        sub = service.manage_subscription(request.user, action)
        return Response({"status": sub.status})
    except Exception as e:
        return Response({"error": str(e)}, status=400)
@api_view(['POST'])
@permission_classes([AllowAny])
def paymob_unified_webhook(request):
    data = request.data
    
    # 1. Detect the Format
    # Format A: Standard (type, obj)
    # Format B: Subscription Module (trigger_type, subscription_data)
    event_type = data.get('type')
    trigger_type = data.get('trigger_type')

    # --- HANDLE FORMAT A (Standard Transaction) ---
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
                tx.gateway_transaction_id = str(obj.get('id'))
                tx.save()
                
                plan_id = obj.get('payment_key_claims', {}).get('subscription_plan_id')
                if plan_id:
                    # Activate using standard helper
                    activate_user_subscription_standard(obj, plan_id, tx.user)

    # --- HANDLE FORMAT B (Subscription Module - The one you just showed me) ---
    elif trigger_type == "Subscription Created" or "subscription_data" in data:
        sub_data = data.get('subscription_data', {})
        gateway_sub_id = str(sub_data.get('id')) # This is the 7742 you saw
        plan_id = str(sub_data.get('plan_id'))   # This is the 6770 you saw
        email = sub_data.get('client_info', {}).get('email')

        try:
            user = User.objects.get(email__iexact=email.strip().lower())
            plan = Subscription.objects.get(gateway_plan_id=plan_id)
            
            user_sub, created = UserSubscription.objects.update_or_create(
                user=user,
                defaults={
                    'subscription': plan,
                    'gateway_subscription_id': gateway_sub_id,
                    'status': 'ACTIVE',
                    'current_period_start': timezone.now(),
                    'current_period_end': timezone.now() + timedelta(days=30),
                }
            )
            print(f"SUCCESS: Captured Sub ID {gateway_sub_id} for {email}")
        except Exception as e:
            print(f"WEBHOOK ERROR (Sub Module): {e}")

    return Response(status=200)

def activate_user_subscription_standard(obj, plan_id, user):
    """Helper for the standard TRANSACTION payload"""
    from payments.models import Subscription, UserSubscription
    try:
        plan = Subscription.objects.get(gateway_plan_id=str(plan_id))
        UserSubscription.objects.update_or_create(
            user=user,
            defaults={
                'subscription': plan,
                'status': 'ACTIVE',
                'current_period_start': timezone.now(),
                'current_period_end': timezone.now() + timedelta(days=30),
            }
        )
    except Exception as e:
        print(f"Activation Error: {e}")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_subscription(request):
    # Use .filter().first() to avoid "MultipleObjectsReturned" crashes
    user_subscription = UserSubscription.objects.filter(
        user=request.user, 
        status='ACTIVE'
    ).select_related('subscription').first() # select_related makes it faster
    
    if not user_subscription:
        return Response(
            {"detail": "No active subscription found."}, 
            status=status.HTTP_404_NOT_FOUND
        )
        
    serializer = UserSubscriptionSerializer(user_subscription)
    return Response(serializer.data, status=status.HTTP_200_OK)