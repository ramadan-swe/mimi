"""
Django signals for the listings app.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from listings.models import Listing, Review

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Listing)
def listing_post_save(sender, instance, created, **kwargs):
    """
    Trigger embedding update when a listing is created or updated.
    Only triggers for ACTIVE listings to avoid unnecessary API calls.
    """
    from listings.tasks import update_listing_embedding
    
    # Only update embeddings for active listings
    if instance.status == 'ACTIVE':
        logger.info(f"Triggering embedding update for listing {instance.id} (created={created})")
        # Use delay() to run asynchronously
        update_listing_embedding.delay(instance.id)
    else:
        logger.debug(f"Skipping embedding update for listing {instance.id} with status {instance.status}")


@receiver(post_save, sender=Review)
def review_post_save(sender, instance, created, **kwargs):
    """
    Trigger embedding update for the associated listing when a review is added or updated.
    Reviews affect the listing's semantic context, so we regenerate the embedding.
    """
    from listings.tasks import update_listing_embedding
    
    # Get the listing from the rental request
    listing = instance.transaction.listing
    
    if listing.status == 'ACTIVE':
        logger.info(f"Triggering embedding update for listing {listing.id} due to review {instance.id}")
        update_listing_embedding.delay(listing.id)
    else:
        logger.debug(f"Skipping embedding update for listing {listing.id} (status: {listing.status})")
