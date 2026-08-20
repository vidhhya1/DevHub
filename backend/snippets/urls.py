from django.urls import path

from .views import (
    SnippetDetailView,
    SnippetListCreateView,
)

urlpatterns = [
    path(
        "projects/<int:project_id>/snippets/",
        SnippetListCreateView.as_view(),
        name="snippet-list-create",
    ),

    path(
        "projects/<int:project_id>/snippets/<int:pk>/",
        SnippetDetailView.as_view(),
        name="snippet-detail",
    ),
]