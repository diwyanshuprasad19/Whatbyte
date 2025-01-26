from django.urls import re_path  # Import re_path
from . import views
from .views import CustomPasswordResetView, CustomPasswordResetConfirmView

urlpatterns = [
    # Account management URLs
    re_path(r"^login/$", views.login_view, name="login"),
    re_path(r"^signup/$", views.signup_view, name="signup"),
    re_path(r"^dashboard/$", views.dashboard_view, name="dashboard"),
    re_path(r"^profile/$", views.profile_view, name="profile"),
    re_path(r"^change-password/$", views.change_password_view, name="change_password"),
    re_path(r"^logout/$", views.logout_view, name="logout"),

    # Password reset URLs
    re_path(r"^forgot-password/$", views.forgot_password_view, name="forgot_password"),
    re_path(r"^password-reset/$", CustomPasswordResetView.as_view(), name="password_reset"),
    re_path(
        r"^password-reset-confirm/(?P<uidb64>[^/]+)/(?P<token>[^/]+)/$",
        CustomPasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    re_path(r"^password-reset-done/$", views.password_reset_done_view, name="password_reset_done"),
    re_path(r"^password-reset-complete/$", views.password_reset_complete_view, name="password_reset_complete"),
]
