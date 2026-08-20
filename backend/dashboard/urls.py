from django.urls import path

from .views import ProjectDashboardView

urlpatterns = [

    path(
        "projects/<int:project_id>/dashboard/",
        ProjectDashboardView.as_view(),
        name="project-dashboard",
    ),

]