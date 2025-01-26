from __future__ import absolute_import, division, print_function, unicode_literals

from django.urls import include, re_path
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns


admin.autodiscover()

urlpatterns = [
    re_path(r'^admin/', admin.site.urls),  # Admin URLs
    re_path(r'^account/', include('webapp.apps.account.urls')),  # Account app URLs
]

# Serve static files in development
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Include staticfiles URL patterns
urlpatterns += staticfiles_urlpatterns()
