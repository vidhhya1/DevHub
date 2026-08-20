from django.db import models

from common.models import BaseModel
from snippets.models import Snippet
from users.models import User


class SnippetVersion(BaseModel):

    snippet = models.ForeignKey(
        Snippet,
        on_delete=models.CASCADE,
        related_name="versions",
    )

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="snippet_versions",
    )

    version_number = models.PositiveIntegerField()

    code = models.TextField()

    message = models.CharField(
        max_length=255,
    )

    class Meta:

        ordering = [
            "-version_number",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "snippet",
                    "version_number",
                ],
                name="unique_version_per_snippet",
            ),
        ]

        indexes = [
            models.Index(fields=["snippet"]),
            models.Index(fields=["version_number"]),
        ]

    def __str__(self):

        return (
            f"{self.snippet.title} "
            f"v{self.version_number}"
        )