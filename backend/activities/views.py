from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from projects.models import Project

from tasks.permissions import IsProjectMember

from .models import Activity
from .serializers import ActivitySerializer


class ActivityListView(generics.ListAPIView):

    serializer_class = ActivitySerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
    ]

    ordering = [
        "-created_at",
    ]

    ordering_fields = [
        "created_at",
    ]

    filterset_fields = [
        "action",
    ]

    def get_queryset(self):

        project = get_object_or_404(
            Project,
            pk=self.kwargs["project_id"],
        )

        return Activity.objects.filter(
            project=project,
        ).select_related(
            "user",
            "task",
        )