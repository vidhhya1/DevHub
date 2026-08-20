from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from projects.models import Project

from .models import Task
from .serializers import TaskSerializer 
from .permissions import (
    IsProjectMember,
    IsTaskEditor,
)
  
from activities.models import Activity
from activities.utils import log_activity 

class TaskListCreateView(generics.ListCreateAPIView):

    serializer_class = TaskSerializer
    permission_classes = [
        IsAuthenticated,IsProjectMember,
    ]

    filterset_fields = [
        "status",
        "priority",
        "assigned_to",
    ]

    search_fields = [
        "title",
        "description",
    ]

    ordering_fields = [
        "created_at",
        "due_date",
        "priority",
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
        project = self.get_project()

        return project.tasks.select_related(
            "created_by",
            "assigned_to",
        )

    def perform_create(self, serializer):

        project = self.get_project()

        task = serializer.save(
            project=project,
            created_by=self.request.user,
        )

        log_activity(
            project=project,
            user=self.request.user,
            task=task,
            action=Activity.Action.CREATED,
            description=f'Created task "{task.title}"',
        )
         
class TaskDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = TaskSerializer
    permission_classes = [
        IsAuthenticated,  
        IsProjectMember,
        IsTaskEditor, 
        
    ]

    def get_project(self):
        return get_object_or_404(
            Project,
            pk=self.kwargs["project_id"],
        )

    def get_queryset(self):
        return Task.objects.filter(
            project_id=self.kwargs["project_id"],
        ).select_related(
            "project",
            "created_by",
            "assigned_to",
        ) 
         
    def perform_destroy(self, instance):

        log_activity(
            project=instance.project,
            user=self.request.user,
            task=instance,
            action=Activity.Action.DELETED,
            description=f'Deleted task "{instance.title}"',
        )

        instance.delete() 
         
    def perform_update(self, serializer):

        task = self.get_object()

        old_status = task.status
        old_priority = task.priority
        old_assigned_to = task.assigned_to

        updated_task = serializer.save()

        activity_logged = False

        if old_status != updated_task.status:
            log_activity(
                project=updated_task.project,
                user=self.request.user,
                task=updated_task,
                action=Activity.Action.STATUS_CHANGED,
                description=(
                    f"Changed status from "
                    f"{old_status} to {updated_task.status}"
                ),
            )
            activity_logged = True

        if old_priority != updated_task.priority:
            log_activity(
                project=updated_task.project,
                user=self.request.user,
                task=updated_task,
                action=Activity.Action.PRIORITY_CHANGED,
                description=(
                    f"Changed priority from "
                    f"{old_priority} to {updated_task.priority}"
                ),
            )
            activity_logged = True

        if old_assigned_to != updated_task.assigned_to:
            username = (
                updated_task.assigned_to.username
                if updated_task.assigned_to
                else "Unassigned"
            )

            log_activity(
                project=updated_task.project,
                user=self.request.user,
                task=updated_task,
                action=Activity.Action.ASSIGNED,
                description=f"Assigned task to {username}",
            )
            activity_logged = True

        if not activity_logged:
            log_activity(
                project=updated_task.project,
                user=self.request.user,
                task=updated_task,
                action=Activity.Action.UPDATED,
                description=f'Updated task "{updated_task.title}"',
            )