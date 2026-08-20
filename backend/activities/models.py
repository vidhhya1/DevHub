from django.db import models

from common.models import BaseModel
from projects.models import Project
from tasks.models import Task
from users.models import User


class Activity(BaseModel):

    class Action(models.TextChoices):

        CREATED = "CREATED", "Created"
        UPDATED = "UPDATED", "Updated"
        DELETED = "DELETED", "Deleted"

        ASSIGNED = "ASSIGNED", "Assigned"

        STATUS_CHANGED = "STATUS_CHANGED", "Status Changed"
        PRIORITY_CHANGED = "PRIORITY_CHANGED", "Priority Changed"

        REVIEW_CREATED = "REVIEW_CREATED", "Review Created"
        REVIEW_UPDATED = "REVIEW_UPDATED", "Review Updated"
        REVIEW_DELETED = "REVIEW_DELETED", "Review Deleted"  
        SNIPPET_CREATED = "SNIPPET_CREATED", "Snippet Created"
        SNIPPET_UPDATED = "SNIPPET_UPDATED", "Snippet Updated"
        SNIPPET_DELETED = "SNIPPET_DELETED", "Snippet Deleted" 
        VERSION_CREATED = "VERSION_CREATED", "Version Created"
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="activities",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="activities",
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="activities",
        null=True,
        blank=True,
    )

    action = models.CharField(
        max_length=30,
        choices=Action.choices,
    )

    description = models.TextField()

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["user"]),
            models.Index(fields=["action"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action}"