from django.contrib.auth import get_user_model

from rest_framework import serializers

from snippets.models import Snippet

from .models import SnippetVersion

User = get_user_model()


class VersionAuthorSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = (
            "id",
            "username",
            "email",
        )


class SnippetVersionSerializer(serializers.ModelSerializer):

    author = VersionAuthorSerializer(
        read_only=True,
    )

    class Meta:

        model = SnippetVersion

        fields = (
            "id",
            "snippet",
            "author",
            "version_number",
            "code",
            "message",
            "created_at",
        )

        read_only_fields = (
            "id",
            "snippet",
            "author",
            "version_number",
            "created_at",
        )