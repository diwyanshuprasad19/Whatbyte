from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView
from django.http import HttpResponseRedirect
from .forms import (
    LoginForm,
    SignupForm,
    ChangePasswordForm,
    PasswordResetEmailForm,
    SetNewPasswordForm,
)
from .service import create_user


# Login Page
def login_view(request):
    if request.method == "POST":
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect("dashboard")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = LoginForm()
    return render(request, "account/login.html", {"form": form})


# Sign Up Page
def signup_view(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
            try:
                user = create_user(
                    username=form.cleaned_data["username"],
                    email=form.cleaned_data["email"],
                    password=form.cleaned_data["password1"],
                )
                login(request, user)
                messages.success(request, "Account created successfully!")
                return redirect("dashboard")
            except Exception as e:
                messages.error(request, f"An error occurred: {str(e)}")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = SignupForm()
    return render(request, "account/signup.html", {"form": form})


# Forgot Password Page
def forgot_password_view(request):
    if request.method == "POST":
        form = PasswordResetEmailForm(request.POST)
        if form.is_valid():
            form.save(
                domain_override=request.get_host(),
                use_https=request.is_secure(),
                request=request,
            )
            messages.success(request, "Password reset email has been sent!")
            return redirect("login")
    else:
        form = PasswordResetEmailForm()
    return render(request, "account/forgot_password.html", {"form": form})


# Dashboard (Authenticated Only)
@login_required
def dashboard_view(request):
    return render(request, "account/dashboard.html", {"user": request.user})


# Profile Page (Authenticated Only)
@login_required
def profile_view(request):
    return render(request, "account/profile.html", {"user": request.user})


# Change Password Page (Authenticated Only)
@login_required
def change_password_view(request):
    if request.method == "POST":
        form = ChangePasswordForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            messages.success(request, "Password updated successfully!")
            return redirect("dashboard")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = ChangePasswordForm(user=request.user)
    return render(request, "account/change_password.html", {"form": form})


# Logout
@login_required
def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect("login")


# Password Reset Views
class CustomPasswordResetView(PasswordResetView):
    template_name = "account/password_reset.html"
    form_class = PasswordResetEmailForm
    success_url = reverse_lazy("password_reset_done")

    def form_valid(self, form):
        try:
            form.save()
            messages.success(self.request, "Password reset email sent successfully!")
            return super().form_valid(form)
        except Exception as e:
            messages.error(self.request, f"An error occurred: {str(e)}")
            return HttpResponseRedirect(self.request.path)


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = "account/password_reset_confirm.html"
    form_class = SetNewPasswordForm
    success_url = reverse_lazy("password_reset_complete")

    def dispatch(self, *args, **kwargs):
        if "uidb64" not in kwargs or "token" not in kwargs:
            messages.error(self.request, "Invalid password reset link.")
            return redirect("password_reset")
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, "Password has been reset successfully!")
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Please correct the errors below.")
        return super().form_invalid(form)


# Password Reset Done View
def password_reset_done_view(request):
    return render(request, "account/password_reset_done.html")


# Password Reset Complete View
def password_reset_complete_view(request):
    return render(request, "account/password_reset_complete.html")
