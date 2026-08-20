from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "project",
        "created_by",
        "assigned_to",
        "status",
        "priority",
        "due_date",
        "created_at",
    )

    list_filter = (
        "status",
        "priority",
        "project",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "project__name",
        "created_by__username",
        "assigned_to__username",
    )

    ordering = (
        "-created_at",
    )