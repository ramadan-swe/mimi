# Generated migration for UserSubscription model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payments', '0003_paymenttransaction'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='period',
            field=models.CharField(choices=[('MONTHLY', 'Monthly'), ('YEARLY', 'Yearly'), ('WEEKLY', 'Weekly')], default='MONTHLY', max_length=20),
        ),
        migrations.AddField(
            model_name='subscription',
            name='gateway_plan_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.CreateModel(
            name='UserSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('CANCELLED', 'Cancelled'), ('EXPIRED', 'Expired'), ('PAST_DUE', 'Past Due'), ('PAUSED', 'Paused')], default='ACTIVE', max_length=20)),
                ('gateway', models.CharField(choices=[('PAYMOB', 'Paymob'), ('STRIPE', 'Stripe'), ('PAYPAL', 'PayPal')], default='PAYMOB', max_length=20)),
                ('gateway_subscription_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('gateway_token_id', models.CharField(blank=True, max_length=100, null=True)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('current_period_start', models.DateTimeField()),
                ('current_period_end', models.DateTimeField()),
                ('cancelled_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('subscription', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='user_subscriptions', to='payments.subscription')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='active_subscription', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='usersubscription',
            index=models.Index(fields=['user', 'status'], name='payments_us_user_id_status_idx'),
        ),
        migrations.AddIndex(
            model_name='usersubscription',
            index=models.Index(fields=['gateway_subscription_id'], name='payments_us_gateway_s_idx'),
        ),
        migrations.AddIndex(
            model_name='usersubscription',
            index=models.Index(fields=['current_period_end'], name='payments_us_current__idx'),
        ),
    ]

