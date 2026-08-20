from django.db import models

from common.models import BaseModel
from tasks.models import Task
from users.models import User


class Review(BaseModel):

    class Status(models.TextChoices):

        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        CHANGES_REQUESTED = (
            "CHANGES_REQUESTED",
            "Changes Requested",
        )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
    )

    comment = models.TextField()

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["task", "reviewer"],
                name="unique_review_per_user_per_task",
            )
        ]

        indexes = [
            models.Index(fields=["task"]),
            models.Index(fields=["reviewer"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return (
            f"{self.task.title} - "
            f"{self.reviewer.username}"
        )