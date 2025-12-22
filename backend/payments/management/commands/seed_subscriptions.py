from django.core.management.base import BaseCommand
from payments.models import Subscription

class Command(BaseCommand):
    help = 'Seeds the database with default subscription tiers'

    def handle(self, *args, **options):
        tiers = [
            {
                "name": "Trial",
                "price": 0,
                "max_listings": 1,
                "features": {}
            },
            {
                "name": "Premium",
                "price": 99,
                "max_listings": 3,
                "features": {"analytics": True}
            },
            {
                "name": "Agency Silver",
                "price": 299,
                "max_listings": 10,
                "features": {"analytics": True, "priority_support": True}
            },
            {
                "name": "Agency Gold",
                "price": 599,
                "max_listings": 999,
                "features": {"analytics": True, "priority_support": True, "featured_listings": True}
            }
        ]

        for tier_data in tiers:
            subscription, created = Subscription.objects.update_or_create(
                name=tier_data["name"],
                defaults={
                    "price": tier_data["price"],
                    "max_listings": tier_data["max_listings"],
                    "features": tier_data["features"]
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created subscription tier: {subscription.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Updated subscription tier: {subscription.name}'))
