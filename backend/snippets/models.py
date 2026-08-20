from django.db import models

from common.models import BaseModel
from projects.models import Project
from tags.models import Tag
from users.models import User


class Snippet(BaseModel):

    class Language(models.TextChoices):

        CPP = "CPP", "C++"
        C = "C", "C"
        JAVA = "JAVA", "Java"
        PYTHON = "PYTHON", "Python"
        JAVASCRIPT = "JAVASCRIPT", "JavaScript"
        TYPESCRIPT = "TYPESCRIPT", "TypeScript"
        GO = "GO", "Go"
        RUST = "RUST", "Rust"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="snippets",
    )

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="snippets",
    )

    title = models.CharField(
        max_length=200,
    )

    description = models.TextField(
        blank=True,
    )

    language = models.CharField(
        max_length=20,
        choices=Language.choices,
    )

    code = models.TextField()

    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="snippets",
    )

    class Meta:

        ordering = [
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "project",
                    "title",
                ],
                name="unique_snippet_title_per_project",
            )
        ]

        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["author"]),
            models.Index(fields=["language"]),
        ]

    def __str__(self):
        return self.title