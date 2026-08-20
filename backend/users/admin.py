from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "organization",
        "is_staff",
        "is_active",
        "date_joined",
    )

    search_fields = (
        "username",
        "email",
        "organization",
    )

    list_filter = (
        "is_staff",
        "is_active",
        "is_superuser",
        "date_joined",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Professional Profile",
            {
                "fields": (
                    "bio",
                    "profile_image",
                    "github_url",
                    "linkedin_url",
                    "organization",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    ) 
     
    ordering = (
        "-date_joined",
   )