from django.urls import path

from .views import (
    VersionListView,
    VersionDetailView,
)

urlpatterns = [
    path(
        "snippets/<int:snippet_id>/versions/",
        VersionListView.as_view(),
        name="version-list",
    ),

    path(
        "snippets/<int:snippet_id>/versions/<int:pk>/",
        VersionDetailView.as_view(),
        name="version-detail",
    ),
]