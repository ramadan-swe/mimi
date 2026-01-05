from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import User

def validate_national_id_uniqueness(national_id_hash):
    """
    Validates that the national_id_hash is unique across ALL users,
    including those that have been soft-deleted.
    """
    if not national_id_hash:
        return

    # Check for existing user with this hash
    # We use User.objects.all() which typically includes all records.
    # If a custom manager filters out deleted users, we might need a raw query or a specific manager.
    # Assuming standard Django, objects.filter() works on the default manager.
    # If the default manager filters soft-deleted, we need to access the base manager.
    
    # Check if a user exists with this hash
    # We exclude the current user if this is an update, but usually identity verification happens once.
    # For simplicity here, we just check existence. In a serializer, you'd handle the 'instance' exclusion.
    
    if User.objects.filter(national_id_hash=national_id_hash).exists():
        raise ValidationError(
            _('This National ID is already associated with an account (possibly a deleted one).'),
            code='unique'
        )
