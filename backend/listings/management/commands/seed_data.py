import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Listing, EGYPT_GOVERNORATES_CHOICES
from faker import Faker

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with users and listings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing data before seeding',
        )

    def handle(self, *args, **options):
        fake = Faker()
        
        if options['clear']:
            self.stdout.write('Clearing data...')
            Listing.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Data cleared.'))

        self.stdout.write('Seeding Users...')
        users = []
        for _ in range(10):
            email = fake.email()
            phone = fake.phone_number()
            # Ensure uniqueness
            if User.objects.filter(username=email).exists():
                continue
                
            user = User.objects.create_user(
                username=email,
                email=email,
                password='password123',
                phone_number=phone[:15], # Truncate to fit
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=random.choice(['OWNER', 'RENTER']),
                is_verified_identity=random.choice([True, False])
            )
            users.append(user)

        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users.'))

        self.stdout.write('Seeding Listings...')
        brands = ['Toyota', 'Hyundai', 'Nissan', 'Kia', 'BMW', 'Mercedes']
        transmissions = ['MANUAL', 'AUTOMATIC']
        fuels = ['BENZINE', 'ELECTRIC', 'HYBRID']
        
        owners = [u for u in users if u.role == 'OWNER']
        if not owners:
            # Fallback if random didn't give owners, verify active user
            owners = User.objects.all()

        for _ in range(30):
            if not owners:
                break
                
            owner = random.choice(owners)
            Listing.objects.create(
                owner=owner,
                title=fake.catch_phrase(),
                brand=random.choice(brands),
                model=fake.word().capitalize(),
                year=random.randint(2010, 2024),
                transmission=random.choice(transmissions),
                fuel_type=random.choice(fuels),
                seats=random.choice([4, 5, 7]),
                doors=4,
                color=fake.color_name(),
                category='MID',
                mileage_range='30-60K',
                daily_price=round(random.uniform(500, 5000), 2),
                governorate=random.choice(EGYPT_GOVERNORATES_CHOICES)[0],
                city=fake.city(),
                status='ACTIVE'
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
