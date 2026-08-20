from django.contrib import admin

from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "project",
        "task",
        "action",
        "created_at",
    )

    list_filter = (
        "action",
        "created_at",
    )

    search_fields = (
        "user__username",
        "project__name",
        "task__title",
        "description",
    )

    ordering = (
        "-created_at",
    )