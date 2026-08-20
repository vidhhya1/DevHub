from rest_framework.permissions import (
    SAFE_METHODS,
    BasePermission,
)

from projects.models import ProjectMember


class IsSnippetEditor(BasePermission):
    """
    Only project members can modify snippets.
    Read-only requests are allowed for project members.
    """

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.method in SAFE_METHODS:
            return True

        return ProjectMember.objects.filter(
            project=obj.project,
            user=request.user,
        ).exists()