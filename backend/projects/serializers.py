from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Project, ProjectMember

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project

        fields = (
            "id",
            "owner",
            "name",
            "description",
            "visibility",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "owner",
            "created_at",
            "updated_at",
        )


class ProjectMemberUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
        )


class ProjectMemberSerializer(serializers.ModelSerializer):

    # Display user details in GET responses
    user = ProjectMemberUserSerializer(read_only=True)

    # Accept a username in POST requests instead of a raw numeric ID -
    # SlugRelatedField looks the user up by username and raises a clean
    # "object does not exist" validation error if it's not found, rather
    # than the caller having to know/guess a database ID.
    username = serializers.SlugRelatedField(
        slug_field="username",
        queryset=User.objects.all(),
        source="user",
        write_only=True,
    )

    class Meta:
        model = ProjectMember

        fields = (
            "id",
            "project",
            "user",
            "username",
            "role",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "project",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        # The duplicate-membership check only makes sense on create.
        # On update (e.g. PATCH-ing just the role), username isn't
        # sent at all, so attrs won't have "user" - reaching for it
        # unconditionally crashed every role update with a KeyError.
        if self.instance is None:
            view = self.context.get("view")
            project = view.get_project()
            user = attrs["user"]

            if ProjectMember.objects.filter(
                project=project,
                user=user,
            ).exists():
                raise serializers.ValidationError(
                    {
                        "username": "This user is already a member of the project."
                    }
                )

        return attrs