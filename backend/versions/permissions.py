from rest_framework.permissions import (
    SAFE_METHODS,
    BasePermission,
)

from projects.models import ProjectMember


class IsVersionCreator(BasePermission):
    """
    Only the creator can modify a version.
    (Currently versions are immutable,
    so this is for future extensibility.)
    """

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.method in SAFE_METHODS:
            return True

        return obj.author == request.user