"""
Management command to manually trigger embedding generation for existing listings.
Useful for backfilling embeddings or testing the embedding system.
"""
from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.tasks import update_listing_embedding


class Command(BaseCommand):
    help = 'Generate embeddings for all active listings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--listing-id',
            type=int,
            help='Generate embedding for a specific listing ID',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Regenerate embeddings even if they already exist',
        )

    def handle(self, *args, **options):
        listing_id = options.get('listing_id')
        force = options.get('force', False)

        if listing_id:
            # Generate for specific listing
            try:
                listing = Listing.objects.get(id=listing_id, status='ACTIVE')
                self.stdout.write(f'Triggering embedding generation for listing {listing_id}...')
                update_listing_embedding.delay(listing_id)
                self.stdout.write(self.style.SUCCESS(f'✓ Task queued for listing {listing_id}'))
            except Listing.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'✗ Listing {listing_id} not found or not active'))
        else:
            # Generate for all active listings
            queryset = Listing.objects.filter(status='ACTIVE')
            
            if not force:
                queryset = queryset.filter(embedding__isnull=True)
            
            count = queryset.count()
            
            if count == 0:
                self.stdout.write(self.style.WARNING('No listings need embedding generation'))
                return
            
            self.stdout.write(f'Queuing embedding generation for {count} listings...')
            
            for listing in queryset:
                update_listing_embedding.delay(listing.id)
            
            self.stdout.write(self.style.SUCCESS(f'✓ Queued {count} embedding generation tasks'))
            self.stdout.write('Check Celery logs to monitor progress: docker-compose logs -f celery')
