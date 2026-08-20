from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from activities.models import Activity
from activities.utils import log_activity

from projects.models import Project
from tasks.permissions import IsProjectMember

from versions.models import SnippetVersion

from .models import Snippet
from .permissions import IsSnippetEditor
from .serializers import SnippetSerializer


class SnippetListCreateView(
    generics.ListCreateAPIView,
):

    serializer_class = SnippetSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
    ]

    filterset_fields = [
        "language",
        "tags",
    ]

    search_fields = [
        "title",
        "description",
        "code",
    ]

    ordering_fields = [
        "created_at",
        "title",
    ]

    ordering = [
        "-created_at",
    ]

    def get_project(self):

        return get_object_or_404(
            Project,
            pk=self.kwargs["project_id"],
        )

    def get_queryset(self):

        return (
            Snippet.objects.filter(
                project=self.get_project(),
            )
            .select_related(
                "author",
                "project",
            )
            .prefetch_related(
                "tags",
            )
        )

    @transaction.atomic
    def perform_create(self, serializer):

        version_message = serializer.validated_data.pop(
            "version_message",
            "Initial version",
        )

        project = self.get_project()

        snippet = serializer.save(
            project=project,
            author=self.request.user,
        )

        SnippetVersion.objects.create(
            snippet=snippet,
            author=self.request.user,
            version_number=1,
            code=snippet.code,
            message=version_message,
        )

        log_activity(
            project=project,
            user=self.request.user,
            action=Activity.Action.SNIPPET_CREATED,
            description=f'Created snippet "{snippet.title}"',
        )


class SnippetDetailView(
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = SnippetSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
        IsSnippetEditor,
    ]

    def get_queryset(self):

        return (
            Snippet.objects.filter(
                project_id=self.kwargs["project_id"],
            )
            .select_related(
                "author",
                "project",
            )
            .prefetch_related(
                "tags",
            )
        )

    @transaction.atomic
    def perform_update(self, serializer):

        old_code = self.get_object().code

        version_message = serializer.validated_data.pop(
            "version_message",
            "Updated snippet",
        )

        snippet = serializer.save()

        if old_code != snippet.code:

            latest = (
                SnippetVersion.objects.filter(
                    snippet=snippet,
                )
                .order_by("-version_number")
                .first()
            )

            version = SnippetVersion.objects.create(
                snippet=snippet,
                author=self.request.user,
                version_number=latest.version_number + 1,
                code=snippet.code,
                message=version_message,
            )

            log_activity(
                project=snippet.project,
                user=self.request.user,
                action=Activity.Action.VERSION_CREATED,
                description=(
                    f'Created Version {version.version_number} '
                    f'for "{snippet.title}"'
                ),
            )

        log_activity(
            project=snippet.project,
            user=self.request.user,
            action=Activity.Action.SNIPPET_UPDATED,
            description=f'Updated snippet "{snippet.title}"',
        ) 
        
    @transaction.atomic
    def perform_destroy(self, instance):

        log_activity(
            project=instance.project,
            user=self.request.user,
            action=Activity.Action.SNIPPET_DELETED,
            description=f'Deleted snippet "{instance.title}"',
        )

        instance.delete()