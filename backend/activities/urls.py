from django.urls import path

from .views import ActivityListView

urlpatterns = [
    path(
        "projects/<int:project_id>/activities/",
        ActivityListView.as_view(),
        name="activity-list",
    ),
]