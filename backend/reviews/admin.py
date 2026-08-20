from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):

    list_display = (
        "task",
        "reviewer",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "task__title",
        "reviewer__username",
        "comment",
    )

    ordering = (
        "-created_at",
    )