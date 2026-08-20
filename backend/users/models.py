from django.contrib.auth.models import AbstractUser
from django.db import models

from common.models import BaseModel


class User(AbstractUser, BaseModel):
    bio = models.TextField(blank=True)

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    github_url = models.URLField(blank=True)

    linkedin_url = models.URLField(blank=True)

    organization = models.CharField(
        max_length=100,
        blank=True
    )

    def __str__(self):
        return self.username