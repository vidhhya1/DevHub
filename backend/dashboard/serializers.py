from rest_framework import serializers


class TaskStatisticsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    todo = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    in_review = serializers.IntegerField()
    done = serializers.IntegerField()


class ProjectDashboardSerializer(serializers.Serializer):

    project_name = serializers.CharField()

    members = serializers.IntegerField()

    snippets = serializers.IntegerField()

    versions = serializers.IntegerField()

    reviews = serializers.IntegerField()

    tasks = TaskStatisticsSerializer()