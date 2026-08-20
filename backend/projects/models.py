from django.db import models

from common.models import BaseModel
from users.models import User


class Project(BaseModel):

    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        PRIVATE = "PRIVATE", "Private"

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    ) 
     
    class Meta:
        ordering = ["-created_at"]  
        
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"],
                name="unique_project_name_per_owner",
            )
        ] 
         
        indexes = [
            models.Index(fields=["owner"]),
        ]
        

    def __str__(self):
        return self.name 
     
class ProjectMember(BaseModel):

    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        MAINTAINER = "MAINTAINER", "Maintainer"
        MEMBER = "MEMBER", "Member"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="members",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "user"],
                name="unique_project_member",
            )
        ]

        ordering = ["project", "role", "user"]  
        
    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role})"