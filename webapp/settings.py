from pathlib import Path
import logging
import logging.config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = '#txqklo&+$gq#ia&)8l9yp9em99szdue)=(8f$9z8btrvwyewt'

DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Local app
    'webapp.apps.account',
]

# site id for email
SITE_ID = 1

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'webapp.urls'

WSGI_APPLICATION = 'webapp.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'webapp' / 'static',  # Correct path to static files
]

# Template configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'webapp' / 'templates',  # Path to templates directory
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Email settings
EMAIL_BACKEND = "webapp.apps.account.custom_email_backend.CombinedEmailBackend"
EMAIL_FILE_PATH = BASE_DIR / "logs/emails"  # Ensure this directory exists
DEFAULT_FROM_EMAIL = "admin@example.com"
DOMAIN = "127.0.0.1:8000"  # Replace with production domain
USE_HTTPS = False  # Set True for HTTPS

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'email_log_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/email.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'email_logger': {
            'handlers': ['email_log_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'