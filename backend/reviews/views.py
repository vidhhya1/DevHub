from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from activities.models import Activity
from activities.utils import log_activity

from tasks.models import Task
from tasks.permissions import IsProjectMember

from .models import Review
from .permissions import IsReviewer
from .serializers import ReviewSerializer


class ReviewListCreateView(
    generics.ListCreateAPIView,
):

    serializer_class = ReviewSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
    ]

    ordering = [
        "-created_at",
    ]

    def get_task(self):
        return get_object_or_404(
            Task,
            pk=self.kwargs["task_id"],
        )

    def get_queryset(self):

        return Review.objects.filter(
            task=self.get_task(),
        ).select_related(
            "reviewer",
            "task",
        )

    def perform_create(self, serializer):

        task = self.get_task()

        review = serializer.save(
            task=task,
            reviewer=self.request.user,
        )

        log_activity(
            project=task.project,
            user=self.request.user,
            task=task,
            action=Activity.Action.REVIEW_CREATED,
            description=f'Reviewed task "{task.title}"',
        )


class ReviewDetailView(
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = ReviewSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
        IsReviewer,
    ]

    def get_task(self):
        return get_object_or_404(
            Task,
            pk=self.kwargs["task_id"],
        )

    def get_queryset(self):

        return Review.objects.filter(
            task_id=self.kwargs["task_id"],
        ).select_related(
            "task",
            "reviewer",
        )

    def perform_update(self, serializer):

        review = serializer.save()

        log_activity(
            project=review.task.project,
            user=self.request.user,
            task=review.task,
            action=Activity.Action.REVIEW_UPDATED,
            description=f'Updated review for "{review.task.title}"',
        )

    def perform_destroy(self, instance):

        log_activity(
            project=instance.task.project,
            user=self.request.user,
            task=instance.task,
            action=Activity.Action.REVIEW_DELETED,
            description=f'Deleted review for "{instance.task.title}"',
        )

        instance.delete()