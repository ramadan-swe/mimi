from celery import shared_task
from django.utils import timezone
from .models import UserSubscription
from .services import PaymentService  # Import your existing service
import logging

logger = logging.getLogger(__name__)

@shared_task(name="run_subscription_renewals")
def run_subscription_renewals():
    """
    Uses the existing PaymentService.process_subscription_renewal 
    to handle automated billing.
    """
    now = timezone.now()
    
    # 1. Find all subscriptions that have reached their end date
    # We filter for ACTIVE ones that are now expired
    subs_to_renew = UserSubscription.objects.filter(
        status='ACTIVE',
        current_period_end__lte=now,
        gateway_token_id__isnull=False # Only if we have a card token
    )

    # 2. Initialize your existing service
    service = PaymentService()

    for sub in subs_to_renew:
        try:
            # 3. Call your function directly
            service.process_subscription_renewal(sub)
            logger.info(f"Successfully processed renewal for {sub.user.email}")
            
        except Exception as e:
            logger.error(f"Failed to renew sub for {sub.user.email}: {str(e)}")