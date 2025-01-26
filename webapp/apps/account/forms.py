from django import forms
from django.contrib.auth.forms import (
    AuthenticationForm,
    UserCreationForm,
    PasswordChangeForm,
    PasswordResetForm,
    SetPasswordForm,
)
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
import re


# Helper function to validate passwords
def validate_password_strength(password):
    if len(password) < 8 or len(password) > 12:
        raise ValidationError("Password must be between 8 and 12 characters.")
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Password must include at least one uppercase letter (A–Z).")
    if not re.search(r'[a-z]', password):
        raise ValidationError("Password must include at least one lowercase letter (a–z).")
    if not re.search(r'[0-9]', password):
        raise ValidationError("Password must include at least one numeric digit (0–9).")
    return password


class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label="Username or Email",
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Enter your username or email"}),
    )
    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Enter your password"}),
    )

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        password = cleaned_data.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise ValidationError("Invalid username or password.")
        return cleaned_data


class SignupForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={"class": "form-control", "placeholder": "Enter your email"}),
    )
    username = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Choose a username"}),
    )
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Enter your password"}),
    )
    password2 = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Confirm your password"}),
    )

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists.")
        return email

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if len(username) < 4:
            raise ValidationError("Username must be at least 4 characters long.")
        return username

    def clean_password1(self):
        password1 = self.cleaned_data.get("password1")
        validate_password_strength(password1)
        return password1

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 != password2:
            raise ValidationError("Passwords do not match.")
        return cleaned_data


class ChangePasswordForm(PasswordChangeForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Enter your old password"})
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Enter a new password"})
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Confirm your new password"})
    )

    def clean_new_password1(self):
        new_password1 = self.cleaned_data.get("new_password1")
        old_password = self.cleaned_data.get("old_password")

        if new_password1 == old_password:
            raise ValidationError("New password must not be the same as the old password.")
        validate_password_strength(new_password1)
        return new_password1

    def clean(self):
        cleaned_data = super().clean()
        new_password1 = cleaned_data.get("new_password1")
        new_password2 = cleaned_data.get("new_password2")

        if new_password1 != new_password2:
            raise ValidationError("New passwords do not match.")
        return cleaned_data


class PasswordResetEmailForm(PasswordResetForm):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={"class": "form-control", "placeholder": "Enter your email"}),
    )

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if not User.objects.filter(email=email).exists():
            raise ValidationError("No user is associated with this email.")
        return email


class SetNewPasswordForm(SetPasswordForm):
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Enter a new password"})
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Confirm your new password"})
    )

    def clean_new_password1(self):
        new_password1 = self.cleaned_data.get("new_password1")
        validate_password_strength(new_password1)
        return new_password1

    def clean(self):
        cleaned_data = super().clean()
        new_password1 = cleaned_data.get("new_password1")
        new_password2 = cleaned_data.get("new_password2")

        if new_password1 != new_password2:
            raise ValidationError("Passwords do not match.")
        return cleaned_data
