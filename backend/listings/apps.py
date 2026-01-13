from django.apps import AppConfig


class ListingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'listings'
    
    def ready(self):
        """Import signals when the app is ready"""
        import listings.signals  # noqa

