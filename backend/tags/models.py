from django.db import models

from common.models import BaseModel


class Tag(BaseModel):

    name = models.CharField(
        max_length=50,
        unique=True,
    )

    class Meta:

        ordering = [
            "name",
        ]

        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self):
        return self.name