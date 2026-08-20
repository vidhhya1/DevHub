from django.contrib import admin

from .models import SnippetVersion


@admin.register(SnippetVersion)
class SnippetVersionAdmin(admin.ModelAdmin):

    list_display = (
        "snippet",
        "version_number",
        "author",
        "created_at",
    )

    search_fields = (
        "snippet__title",
        "author__username",
        "message",
    )

    ordering = (
        "-created_at",
    )