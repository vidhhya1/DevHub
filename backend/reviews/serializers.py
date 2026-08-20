from django.contrib.auth import get_user_model

from rest_framework import serializers

from projects.models import ProjectMember

from .models import Review

User = get_user_model()


class ReviewerSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
        )


class ReviewSerializer(serializers.ModelSerializer):

    reviewer = ReviewerSerializer(
        read_only=True,
    )

    class Meta:
        model = Review

        fields = (
            "id",
            "task",
            "reviewer",
            "status",
            "comment",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "task",
            "reviewer",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):

        task = self.context["view"].get_task()

        reviewer = self.context["request"].user

        if (
            self.instance is None
            and Review.objects.filter(
                task=task,
                reviewer=reviewer,
            ).exists()
        ):
            raise serializers.ValidationError(
                {
                    "reviewer":
                    "You have already reviewed this task."
                }
            )

        if not ProjectMember.objects.filter(
            project=task.project,
            user=reviewer,
        ).exists():
            raise serializers.ValidationError(
                {
                    "reviewer":
                    "Only project members can review this task."
                }
            )

        return attrs