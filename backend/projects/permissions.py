from rest_framework.permissions import SAFE_METHODS, BasePermission
from django.shortcuts import get_object_or_404

from .models import Project

class IsProjectOwner(BasePermission):
    """
    Only the owner can modify a project.

    Safe (read-only) requests are allowed for anyone if the project
    is PUBLIC, and for the owner/members only if the project is PRIVATE.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            if obj.visibility == Project.Visibility.PUBLIC:
                return True

            if not request.user or not request.user.is_authenticated:
                return False

            return (
                obj.owner_id == request.user.id
                or obj.members.filter(user=request.user).exists()
            )

        return obj.owner == request.user 
      
class IsProjectOwnerForMemberManagement(BasePermission):
    """
    Only the project owner can manage project members.
    Safe methods are allowed.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        project = get_object_or_404(
            Project,
            pk=view.kwargs["project_id"],
        )

        return project.owner == request.user