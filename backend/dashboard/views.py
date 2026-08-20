from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from projects.models import Project
from tasks.permissions import IsProjectMember
from tasks.models import Task

from versions.models import SnippetVersion
from reviews.models import Review

from .serializers import ProjectDashboardSerializer


class ProjectDashboardView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
    ]

    def get(self, request, project_id):

        project = get_object_or_404(
            Project,
            pk=project_id,
        )

        task_stats = project.tasks.aggregate(
            total=Count("id"),

            todo=Count(
                "id",
                filter=Q(
                    status=Task.Status.TODO
                ),
            ),

            in_progress=Count(
                "id",
                filter=Q(
                    status=Task.Status.IN_PROGRESS
                ),
            ),

            in_review=Count(
                "id",
                filter=Q(
                    status=Task.Status.IN_REVIEW
                ),
            ),

            done=Count(
                "id",
                filter=Q(
                    status=Task.Status.DONE
                ),
            ),
        )

        data = {
            "project_name": project.name,

            "members": project.members.count(),

            "tasks": task_stats,

            "snippets": project.snippets.count(),

            "versions": SnippetVersion.objects.filter(
                snippet__project=project,
            ).count(),

            "reviews": Review.objects.filter(
                task__project=project,
            ).count(),
        }

        serializer = ProjectDashboardSerializer(
            data
        )

        return Response(
            serializer.data
        )