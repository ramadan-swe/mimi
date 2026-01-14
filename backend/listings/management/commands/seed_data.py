"""
Django management command to seed the database with realistic test data.
Creates users, vehicles, listings, rental requests, and reviews.
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import (
    Vehicle, Listing, Review, RentalRequest, ListingImage,
    TransmissionType, FuelType, SeatCount, DoorCount, Category, 
    MileageRange, Governorate, RentalRequestStatus
)
from payments.models import Subscription, UserSubscription
from faker import Faker

User = get_user_model()
fake = Faker()



class Command(BaseCommand):
    help = 'Seeds the database with comprehensive test data for embeddings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing data before seeding',
        )
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create (default: 20)',
        )
        parser.add_argument(
            '--listings',
            type=int,
            default=50,
            help='Number of listings to create (default: 50)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Review.objects.all().delete()
            RentalRequest.objects.all().delete()
            ListingImage.objects.all().delete()
            Listing.objects.all().delete()
            Vehicle.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('✓ Data cleared'))

        # Create subscription tiers if they don't exist
        self._create_subscription_tiers()
        
        # Create users
        users = self._create_users(options['users'])
        
        # Create vehicles and listings
        listings = self._create_listings(users, options['listings'])
        
        # Create rental requests and reviews
        self._create_reviews(users, listings)
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully seeded database!'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(users)} users'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(listings)} listings'))
        self.stdout.write(self.style.SUCCESS(f'  - Reviews created for completed rentals'))

    def _create_subscription_tiers(self):
        """Create default subscription tiers if they don't exist"""
        tiers = [
            {'name': 'Free', 'max_listings': 3, 'price': Decimal('0.00'), 'period': 'MONTHLY'},
            {'name': 'Basic', 'max_listings': 10, 'price': Decimal('99.00'), 'period': 'MONTHLY'},
            {'name': 'Premium', 'max_listings': 50, 'price': Decimal('299.00'), 'period': 'MONTHLY'},
            {'name': 'Enterprise', 'max_listings': 999, 'price': Decimal('999.00'), 'period': 'MONTHLY'},
        ]
        
        for tier_data in tiers:
            Subscription.objects.get_or_create(
                name=tier_data['name'],
                defaults={
                    'max_listings': tier_data['max_listings'],
                    'price': tier_data['price'],
                    'period': tier_data['period'],
                    'features': {},
                }
            )

    def _create_users(self, count):
        """Create test users with verified identities"""
        self.stdout.write(f'Creating {count} users...')
        users = []
        
        for i in range(count):
            email = f'user{i}@renty.test'
            
            # Skip if user already exists
            if User.objects.filter(email=email).exists():
                users.append(User.objects.get(email=email))
                continue
            
            user = User.objects.create_user(
                username=email,
                email=email,
                password='password123',
                phone_number=f'+201{random.randint(100000000, 999999999)}',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=random.choice(['OWNER', 'RENTER', 'OWNER']),  # More owners
                is_verified_identity=True,
                is_phone_verified=True,
                waseet_score=random.randint(60, 100),
            )
            
            # Assign subscription
            if user.role == 'OWNER':
                from django.utils import timezone
                from datetime import timedelta
                
                tier = Subscription.objects.get(name=random.choice(['Free', 'Premium']))
                
                # Create UserSubscription
                now = timezone.now()
                UserSubscription.objects.create(
                    user=user,
                    subscription=tier,
                    status='ACTIVE',
                    gateway='PAYMOB',
                    current_period_start=now,
                    current_period_end=now + timedelta(days=30),
                )
                user.save()
            
            users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(users)} users'))
        return users

    def _create_listings(self, users, count):
        """Create vehicles and listings with realistic data"""
        self.stdout.write(f'Creating {count} listings...')
        
        # Car data
        car_brands = {
            'Toyota': ['Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Yaris'],
            'Hyundai': ['Elantra', 'Tucson', 'Santa Fe', 'Accent', 'Kona'],
            'Nissan': ['Sunny', 'Altima', 'X-Trail', 'Patrol', 'Kicks'],
            'Kia': ['Cerato', 'Sportage', 'Sorento', 'Rio', 'Seltos'],
            'BMW': ['320i', '520i', 'X3', 'X5', 'M3'],
            'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
            'Chevrolet': ['Cruze', 'Malibu', 'Tahoe', 'Suburban', 'Spark'],
            'Mazda': ['3', '6', 'CX-5', 'CX-9', 'MX-5'],
        }
        
        colors = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Beige', 'Brown']
        
        governorates_cities = {
            Governorate.CAIRO: ['Nasr City', 'Maadi', 'Heliopolis', 'New Cairo', '6th October'],
            Governorate.ALEXANDRIA: ['Miami', 'Sidi Gaber', 'Sporting', 'Montaza', 'Agami'],
            Governorate.GIZA: ['Dokki', 'Mohandessin', 'Sheikh Zayed', 'Haram', '6th October'],
            Governorate.RED_SEA: ['Hurghada', 'Sharm El Sheikh', 'Dahab', 'Marsa Alam'],
            Governorate.SOUTH_SINAI: ['Sharm El Sheikh', 'Dahab', 'Nuweiba', 'Taba'],
        }
        
        owners = [u for u in users if u.role == 'OWNER']
        if not owners:
            owners = users[:10]  # Fallback
        
        listings = []
        
        for i in range(count):
            owner = random.choice(owners)
            brand = random.choice(list(car_brands.keys()))
            model = random.choice(car_brands[brand])
            year = random.randint(2015, 2024)
            category = random.choice(list(Category))
            governorate = random.choice(list(governorates_cities.keys()))
            city = random.choice(governorates_cities[governorate])
            
            # Create vehicle
            vehicle = Vehicle.objects.create(
                owner=owner,
                brand=brand,
                model=model,
                year=year,
                transmission=random.choice(list(TransmissionType)),
                fuel_type=random.choice(list(FuelType)),
                seats=random.choice([4, 5, 7]),
                doors=random.choice([2, 4]),
                color=random.choice(colors),
                category=category,
                mileage_range=random.choice(list(MileageRange)),
                is_insured=random.choice([True, True, False]),  # More insured
                extras={
                    'AC': True,
                    'GPS': random.choice([True, False]),
                    'Bluetooth': random.choice([True, False]),
                    'Cruise_Control': random.choice([True, False]),
                    'Parking_Sensor': random.choice([True, False]),
                    'Rear_Camera': random.choice([True, False]),
                    'Baby_Seat': random.choice([True, False]),
                }
            )
            
            # Create listing with descriptive title
            title = f"{year} {brand} {model} - {category.label} in {city}"
            
            # Price based on category and year
            base_price = {
                Category.BASE: 300,
                Category.MID: 500,
                Category.HIGH: 800,
                Category.TOP: 1200,
                Category.PREMIUM: 2000,
            }[category]
            
            # Adjust for year
            age_factor = 1 + (year - 2015) * 0.05
            daily_price = Decimal(str(round(base_price * age_factor, 2)))
            
            listing = Listing.objects.create(
                vehicle=vehicle,
                owner=owner,
                title=title,
                daily_price=daily_price,
                weekly_discount=Decimal(str(random.choice([0, 5, 10, 15]))),
                monthly_discount=Decimal(str(random.choice([0, 10, 15, 20]))),
                governorate=governorate,
                city=city,
                status='ACTIVE',
            )
            
            # Add images to listing
            self._add_listing_images(listing)
            
            listings.append(listing)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(listings)} listings'))
        return listings

    def _add_listing_images(self, listing):
        """Copy test images and create ListingImage entries for a listing"""
        import os
        import shutil
        from django.conf import settings
        from django.core.files import File
        
        # Map test image filenames to ImageType choices
        image_mapping = {
            'main.png': ('MAIN', 0),
            'back.png': ('BACK', 1),
            'back-left.png': ('LEFT', 2),
            'back-right.png': ('RIGHT', 3),
            'right-side.png': ('FRONT', 4),
            'inner-car.png': ('INTERIOR', 5),
        }
        
        source_dir = os.path.join(settings.BASE_DIR, 'static', 'test-images')
        
        # Check if source directory exists
        if not os.path.exists(source_dir):
            return
        
        for filename, (image_type, order) in image_mapping.items():
            source_path = os.path.join(source_dir, filename)
            
            if os.path.exists(source_path):
                # Create ListingImage with the file
                with open(source_path, 'rb') as f:
                    listing_image = ListingImage(
                        listing=listing,
                        image_type=image_type,
                        order=order
                    )
                    # Save the file with Django's file handling
                    listing_image.image.save(filename, File(f), save=True)

    def _create_reviews(self, users, listings):
        """Create rental requests and reviews"""
        self.stdout.write('Creating rental requests and reviews...')
        
        renters = [u for u in users if u.role == 'RENTER']
        if not renters:
            renters = users[:10]
        
        review_comments = [
            "Great car! Very clean and comfortable. Owner was professional.",
            "Excellent experience. The car was in perfect condition.",
            "Good value for money. Would rent again!",
            "Amazing car! Smooth ride and well-maintained.",
            "Very satisfied with the rental. Highly recommended.",
            "Perfect for our family trip. Spacious and comfortable.",
            "The car exceeded our expectations. Great service!",
            "Fantastic experience from start to finish.",
            "Clean, reliable, and affordable. What more could you ask for?",
            "Best rental experience I've had. Five stars!",
            "Good car but could be cleaner.",
            "Decent experience overall. Car was okay.",
            "Car was good but pickup was delayed.",
            "Nice car, friendly owner. Would recommend.",
            "Excellent condition, fuel efficient, and comfortable.",
            "Perfect for city driving. Easy to park and maneuver.",
            "Great for long trips. Very comfortable on highways.",
            "Luxury feel at a reasonable price. Loved it!",
            "Reliable and safe. Perfect for family use.",
            "Sporty and fun to drive. Had a great time!",
        ]
        
        review_count = 0
        
        # Create reviews for about 40% of listings
        for listing in random.sample(listings, int(len(listings) * 0.4)):
            # Create 1-3 completed rentals per listing
            num_rentals = random.randint(1, 3)
            
            for _ in range(num_rentals):
                renter = random.choice(renters)
                
                # Create a completed rental in the past
                days_ago = random.randint(10, 90)
                end_date = datetime.now().date() - timedelta(days=days_ago)
                start_date = end_date - timedelta(days=random.randint(2, 14))
                
                rental_days = (end_date - start_date).days
                total_price = listing.daily_price * rental_days
                
                rental_request = RentalRequest.objects.create(
                    renter=renter,
                    listing=listing,
                    start_date=start_date,
                    end_date=end_date,
                    total_price=total_price,
                    status=RentalRequestStatus.COMPLETED,
                    renter_confirmed=True,
                    owner_confirmed=True,
                )
                
                # Create review from renter
                Review.objects.create(
                    transaction=rental_request,
                    reviewer=renter,
                    rating=random.randint(3, 5),  # Mostly positive reviews
                    comment=random.choice(review_comments),
                )
                review_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {review_count} reviews'))
