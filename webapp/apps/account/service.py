import logging
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.conf import settings
from .email_templates import (
    ACCOUNT_CREATION_SUBJECT,
    ACCOUNT_CREATION_BODY,
)

# Set up logging for email actions
email_logger = logging.getLogger('email_logger')


def create_user(username, email, password):
    """
    Create a new user and send a welcome email.
    """
    try:
        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        # Prepare and send the welcome email
        subject = ACCOUNT_CREATION_SUBJECT
        message = ACCOUNT_CREATION_BODY.format(username=username)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,  # Raise an exception if the email fails to send
        )

        # Log success
        email_logger.info(f"Welcome email successfully sent to {email}.")
        return user

    except Exception as e:
        # Log error
        email_logger.error(f"Failed to create user or send welcome email to {email}: {e}")
        raise


def send_reset_password_email(email, reset_link):
    """
    Send a password reset email.
    """
    try:
        # Prepare and send the password reset email
        send_mail(
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,  # Raise an exception if the email fails to send
        )

        # Log success
        email_logger.info(f"Password reset email successfully sent to {email}.")
    except Exception as e:
        # Log error
        email_logger.error(f"Failed to send password reset email to {email}: {e}")
        raise
