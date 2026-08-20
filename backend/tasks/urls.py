from django.urls import path

from .views import (
    TaskDetailView,
    TaskListCreateView,
)

urlpatterns = [
    path(
        "projects/<int:project_id>/tasks/",
        TaskListCreateView.as_view(),
        name="task-list-create",
    ),

    path(
        "projects/<int:project_id>/tasks/<int:pk>/",
        TaskDetailView.as_view(),
        name="task-detail",
    ),
]