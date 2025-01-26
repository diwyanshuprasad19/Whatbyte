from django.apps import AppConfig


class AccountConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'webapp.apps.account'  # Ensure this is the correct dotted path
