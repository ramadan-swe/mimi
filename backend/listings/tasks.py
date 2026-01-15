"""
Celery tasks for the listings app.
"""
import logging
from celery import shared_task
from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def update_listing_embedding(self, listing_id):
    """
    Generate and update the embedding for a listing.
    
    This task:
    1. Fetches the listing with all related data (vehicle, reviews)
    2. Aggregates them into a descriptive string
    3. Calls OpenAI's text-embedding-3-small API
    4. Saves the vector to the Listing.embedding field
    
    Args:
        listing_id: The ID of the listing to update
        
    Returns:
        dict: Status information about the embedding update
    """
    from listings.models import Listing
    
    try:
        # Fetch the listing with related data
        listing = Listing.objects.select_related('vehicle', 'owner').prefetch_related(
            'requests__reviews'
        ).get(id=listing_id)
        
        # Build the descriptive text for embedding
        text_parts = []
        
        # Add listing information
        text_parts.append(f"Title: {listing.title}")
        text_parts.append(f"Location: {listing.city}, {listing.governorate}")
        text_parts.append(f"Daily Price: {listing.daily_price} EGP")
        
        # Add vehicle information if available
        if listing.vehicle:
            vehicle = listing.vehicle
            text_parts.append(f"Vehicle: {vehicle.year} {vehicle.brand} {vehicle.model}")
            text_parts.append(f"Category: {vehicle.get_category_display()}")
            text_parts.append(f"Transmission: {vehicle.get_transmission_display()}")
            text_parts.append(f"Fuel Type: {vehicle.get_fuel_type_display()}")
            text_parts.append(f"Seats: {vehicle.seats}")
            text_parts.append(f"Color: {vehicle.color}")
            text_parts.append(f"Mileage: {vehicle.get_mileage_range_display()}")
            text_parts.append(f"Insured: {'Yes' if vehicle.is_insured else 'No'}")
            
            # Add extras if available
            if vehicle.extras:
                extras_list = [k.replace('_', ' ') for k, v in vehicle.extras.items() if v]
                if extras_list:
                    text_parts.append(f"Features: {', '.join(extras_list)}")
        
        # Add review comments
        reviews = []
        for request in listing.requests.all():
            for review in request.reviews.all():
                if review.comment:
                    reviews.append(review.comment)
        
        if reviews:
            text_parts.append(f"Customer Reviews: {' | '.join(reviews)}")
        
        # Combine all parts
        aggregated_text = ". ".join(text_parts)
        
        logger.info(f"Generating embedding for listing {listing_id}. Text length: {len(aggregated_text)}")
        
        # Call OpenAI API to generate embedding
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=aggregated_text,
            encoding_format="float"
        )
        
        # Extract the embedding vector
        embedding_vector = response.data[0].embedding
        
        # Save to database - disconnect signal to prevent infinite loop
        from listings.signals import listing_post_save
        from django.db.models.signals import post_save
        
        # Disconnect the signal before saving to prevent re-triggering the task
        post_save.disconnect(listing_post_save, sender=Listing)
        try:
            listing.embedding = embedding_vector
            listing.save(update_fields=['embedding'])
        finally:
            # Always reconnect the signal
            post_save.connect(listing_post_save, sender=Listing)
        
        logger.info(f"Successfully updated embedding for listing {listing_id}")
        
        return {
            'status': 'success',
            'listing_id': listing_id,
            'text_length': len(aggregated_text),
            'embedding_dimensions': len(embedding_vector)
        }
        
    except Listing.DoesNotExist:
        logger.error(f"Listing {listing_id} does not exist")
        return {'status': 'error', 'message': 'Listing not found'}
        
    except Exception as exc:
        logger.error(f"Error updating embedding for listing {listing_id}: {str(exc)}")
        # Retry the task with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
