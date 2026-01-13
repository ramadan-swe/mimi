from celery import shared_task
from django.utils import timezone
from .models import UserSubscription
from .services import SubscriptionService
import logging

logger = logging.getLogger(__name__)

@shared_task(name="run_subscription_renewals")
def run_subscription_renewals():
    """
    Uses the existing SubscriptionService to handle automated billing.
    Note: This task requires a process_subscription_renewal method to be implemented.
    """
    now = timezone.now()
    
    # 1. Find all subscriptions that have reached their end date
    # We filter for ACTIVE ones that are now expired
    subs_to_renew = UserSubscription.objects.filter(
        status='ACTIVE',
        current_period_end__lte=now,
        gateway_token_id__isnull=False # Only if we have a card token
    )

    # 2. Initialize the service
    service = SubscriptionService()

    # TODO: Implement process_subscription_renewal method in SubscriptionService
    # for sub in subs_to_renew:
    #     try:
    #         service.process_subscription_renewal(sub)
    #         logger.info(f"Successfully processed renewal for {sub.user.email}")
    #     except Exception as e:
    #         logger.error(f"Failed to renew sub for {sub.user.email}: {str(e)}")
    
    logger.info(f"Found {subs_to_renew.count()} subscriptions to renew (renewal logic not yet implemented)")