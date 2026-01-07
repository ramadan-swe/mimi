from django.conf import settings
from twilio.rest import Client
import random
from django.utils import timezone
from datetime import timedelta
from notifications.models import PhoneVerification
from django.contrib.auth import get_user_model

User = get_user_model()

def generate_otp():
    return str(random.randint(100000, 999999))

def send_whatsapp_otp(phone_number):
    """
    Generates an OTP, stores it in PhoneVerification, and sends it via WhatsApp.
    """
    # 1. Generate Code
    otp_code = generate_otp()
    
    # 2. Get User (Assuming phone_number is already linked to a user or we pass user)
    # Actually, usually we verify the phone of the request.user or during registration.
    # For now, let's assume valid user exists or we handle it.
    try:
        user = User.objects.get(phone_number=phone_number)
    except User.DoesNotExist:
        # For security, you might not want to reveal user existence, 
        # but for this specific flow 'Verify Phone', the user should be logged in or registering.
        return False, "User not found"

    # 3. Store in DB
    expiration = timezone.now() + timedelta(minutes=10)
    PhoneVerification.objects.update_or_create(
        user=user,
        defaults={
            'otp_code': otp_code,
            'expires_at': expiration,
            'is_verified': False
        }
    )

    # 4. Send via Twilio
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    # Twilio WhatsApp numbers need "whatsapp:" prefix
    to_number = f"whatsapp:{phone_number}"
    from_number = settings.TWILIO_FROM_NUMBER # e.g. 'whatsapp:+14155238886'
    
    try:
        message = client.messages.create(
            from_=from_number,
            body=f"Your verification code for Mimi is: {otp_code}",
            to=to_number
        )
        return True, message.sid
    except Exception as e:
        return False, str(e)
