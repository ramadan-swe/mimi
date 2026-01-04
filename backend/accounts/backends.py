from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrPhoneBackend(ModelBackend):
    """
    Custom authentication backend to allow login with either email or phone number.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
            
        try:
            # Check if the user exists with the given email or phone number
            user = User.objects.get(Q(email=username) | Q(phone_number=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # This shouldn't happen if fields are unique, but good to handle
            return User.objects.filter(Q(email=username) | Q(phone_number=username)).order_by('id').first()

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
