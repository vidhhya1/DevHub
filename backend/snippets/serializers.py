from django.contrib.auth import get_user_model

from rest_framework import serializers

from tags.models import Tag
from tags.serializers import TagSerializer

from .models import Snippet

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = (
            "id",
            "username",
            "email",
        )


class SnippetSerializer(serializers.ModelSerializer):

    author = AuthorSerializer(
        read_only=True,
    )

    tags = TagSerializer(
        many=True,
        read_only=True,
    )

    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False,
    ) 
     
    # No serializer-level default here on purpose: the fallback message
    # differs between create ("Initial version") and update ("Updated
    # snippet"), and a shared default would always win over both,
    # since DRF pre-populates validated_data whenever a field has one.
    version_message = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    class Meta:

        model = Snippet

        fields = (
            "id",
            "project",
            "author",
            "title",
            "description",
            "language",
            "code",
            "tags",
            "tag_ids",
            "version_message",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "project",
            "author",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):

        tags = validated_data.pop(
            "tag_ids",
            [],
        )

        snippet = Snippet.objects.create(
            **validated_data,
        )

        snippet.tags.set(tags)

        return snippet

    def update(self, instance, validated_data):

        tags = validated_data.pop(
            "tag_ids",
            None,
        )

        for attr, value in validated_data.items():
            setattr(
                instance,
                attr,
                value,
            )

        instance.save()

        if tags is not None:
            instance.tags.set(tags)

        return instance