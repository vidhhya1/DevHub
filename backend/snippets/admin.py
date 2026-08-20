from django.contrib import admin

from .models import Snippet


@admin.register(Snippet)
class SnippetAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "project",
        "author",
        "language",
        "created_at",
    )

    list_filter = (
        "language",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "code",
    )

    filter_horizontal = (
        "tags",
    )

    ordering = (
        "-created_at",
    )