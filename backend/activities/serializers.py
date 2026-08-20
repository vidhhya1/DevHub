from rest_framework import serializers

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):

    user = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    # A plain CharField(source="task.title") silently disappears from
    # the response for activities with no task (e.g. snippet activities),
    # instead of raising or returning null. Use a method field so every
    # activity has a consistent, explicit "task" key (null when absent).
    task = serializers.SerializerMethodField()

    def get_task(self, obj):
        return obj.task.title if obj.task_id else None

    class Meta:
        model = Activity

        fields = (
            "id",
            "user",
            "task",
            "action",
            "description",
            "created_at",
        )