from django.db import migrations

def seed_subscriptions(apps, schema_editor):
    Subscription = apps.get_model('payments', 'Subscription')
    
    subscriptions = [
        {
            "name": "Free",
            "max_listings": 1,
            "price": 0.00,
            "features": {"analytics": False, "priority_support": False}
        },
        {
            "name": "Premium",
            "max_listings": 10,
            "price": 199.00,
            "features": {"analytics": True, "priority_support": True}
        },
        {
            "name": "Agency",
            "max_listings": 50,
            "price": 999.00,
            "features": {"analytics": True, "priority_support": True, "batch_upload": True}
        }
    ]

    for sub_data in subscriptions:
        Subscription.objects.get_or_create(name=sub_data['name'], defaults=sub_data)

class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_subscriptions),
    ]
