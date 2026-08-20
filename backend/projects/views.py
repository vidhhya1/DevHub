from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response

from .models import Project, ProjectMember
from .permissions import (
    IsProjectOwner,
    IsProjectOwnerForMemberManagement,
)
from .serializers import (
    ProjectSerializer,
    ProjectMemberSerializer,
)


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = [
        "visibility",
    ]

    def get_queryset(self):
        # A user may see every PUBLIC project, plus any PRIVATE
        # project they own or are a member of. This keeps private
        # projects private while still satisfying "list/filter/search"
        # requirements for projects a user can legitimately access.
        user = self.request.user

        return Project.objects.filter(
            Q(visibility=Project.Visibility.PUBLIC)
            | Q(owner=user)
            | Q(members__user=user)
        ).distinct()

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "created_at",
        "name",
    ]

    ordering = [
        "-created_at",
    ]
    
    @transaction.atomic
    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)

        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role=ProjectMember.Role.OWNER,
        )
         
         
 
class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectOwner]
     
class ProjectMemberListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated,IsProjectOwnerForMemberManagement,]

    def get_project(self):
        return get_object_or_404(
            Project,
            pk=self.kwargs["project_id"],
        )

    def get_queryset(self):
        project = self.get_project()
        return project.members.select_related("user")

    def perform_create(self, serializer):
        project = self.get_project()

        serializer.save(
            project=project,
        ) 
        
class ProjectMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [
        IsAuthenticated,
        IsProjectOwnerForMemberManagement,
    ]

    def get_project(self):
        return get_object_or_404(
            Project,
            pk=self.kwargs["project_id"],
        )

    def get_queryset(self):
        return ProjectMember.objects.filter(
            project_id=self.kwargs["project_id"]
        ).select_related(
            "project",
            "user",
        ) 
    
    def destroy(self, request, *args, **kwargs):
        member = self.get_object()

        if member.user == member.project.owner:
            return Response(
                {
                    "detail": "Project owner cannot be removed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)