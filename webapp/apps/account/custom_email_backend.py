from django.core.mail.backends.console import EmailBackend as ConsoleBackend
from django.core.mail.backends.filebased import EmailBackend as FileBackend
from django.conf import settings


class CombinedEmailBackend:
    def __init__(self, *args, **kwargs):
        # Initialize console backend
        self.console_backend = ConsoleBackend(*args, **kwargs)
        
        # Extract file path for file backend from settings
        file_backend_kwargs = kwargs.copy()
        file_backend_kwargs["file_path"] = settings.EMAIL_FILE_PATH
        self.file_backend = FileBackend(*args, **file_backend_kwargs)

    def send_messages(self, email_messages):
        # Send emails to console
        self.console_backend.send_messages(email_messages)
        # Save emails to file
        return self.file_backend.send_messages(email_messages)

