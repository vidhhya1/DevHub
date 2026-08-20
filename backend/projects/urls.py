from django.urls import path 

from .views import ProjectDetailView,ProjectListCreateView  
from .views import ProjectMemberListCreateView 
from .views import ProjectMemberDetailView

urlpatterns = [
    path(
        "",
        ProjectListCreateView.as_view(),
        name="project-list-create",
    ), 
    path(
        "<int:pk>/",
        ProjectDetailView.as_view(),
        name="project-detail",
    ), 
    path(
        "<int:project_id>/members/",
        ProjectMemberListCreateView.as_view(),
        name="project-member-list-create",
    ), 
    path(
        "<int:project_id>/members/<int:pk>/",
        ProjectMemberDetailView.as_view(),
        name="project-member-detail",
    ),
]