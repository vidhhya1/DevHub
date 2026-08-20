from django.shortcuts import get_object_or_404

from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)

from projects.models import Project, ProjectMember
from tasks.models import Task
from snippets.models import Snippet


def user_is_project_member(project, user):
    return (
        project.owner_id == user.id
        or ProjectMember.objects.filter(
            project=project,
            user=user,
        ).exists()
    )


class IsProjectMember(BasePermission):
    """
    Allows authenticated users who are project
    members or the project owner to access
    project resources.
    """

    def has_permission(self, request, view):

        if "project_id" in view.kwargs:
            project = get_object_or_404(
                Project,
                pk=view.kwargs["project_id"],
            )

        elif "task_id" in view.kwargs:
            task = get_object_or_404(
                Task,
                pk=view.kwargs["task_id"],
            )

            project = task.project

        elif "snippet_id" in view.kwargs:
            snippet = get_object_or_404(
                Snippet,
                pk=view.kwargs["snippet_id"],
            )

            project = snippet.project

        else:
            return False

        return user_is_project_member(
            project,
            request.user,
        )


class IsTaskEditor(BasePermission):
    """
    Only project members or the project owner
    can modify tasks.
    """

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.method in SAFE_METHODS:
            return True

        return user_is_project_member(
            obj.project,
            request.user,
        )