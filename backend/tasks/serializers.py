from django.contrib.auth import get_user_model
from rest_framework import serializers

from projects.models import ProjectMember

from .models import Task

User = get_user_model()


class TaskUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
        )


class TaskSerializer(serializers.ModelSerializer):

    # Display creator details
    created_by = TaskUserSerializer(read_only=True)

    # Display assigned user details
    assigned_to = TaskUserSerializer(read_only=True)

    # Accept assigned user id in POST/PATCH
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="assigned_to",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Task

        fields = (
            "id",
            "project",
            "created_by",
            "assigned_to",
            "assigned_to_id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "project",
            "created_by",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        project = self.context["view"].get_project()

        assigned_to = attrs.get("assigned_to")

        if assigned_to is not None:
            if not ProjectMember.objects.filter(
                project=project,
                user=assigned_to,
            ).exists():
                raise serializers.ValidationError(
                    {
                        "assigned_to_id": (
                            "Assigned user must be a project member."
                        )
                    }
                )

        return attrs