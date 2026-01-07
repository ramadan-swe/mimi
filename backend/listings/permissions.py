from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user


class IsVerified(permissions.BasePermission):
    """
    Custom permission to only allow verified users.
    """
    message = "You must verify your phone number before creating listings."

    def has_permission(self, request, view):
        # Read permissions allowed for all
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require authentication and verification
        return request.user and request.user.is_authenticated and request.user.is_phone_verified


class CanCreateListing(permissions.BasePermission):
    """
    Check if user has quota to create more listings based on subscription.
    """
    message = "You have reached the maximum number of listings for your subscription."

    def has_permission(self, request, view):
        # Only check on create action
        if request.method != 'POST':
            return True
        
        return request.user and request.user.is_authenticated and request.user.can_create_listing()
