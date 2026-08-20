from django.urls import path

from .views import (
    TagDetailView,
    TagListCreateView,
)

urlpatterns = [
    path(
        "tags/",
        TagListCreateView.as_view(),
        name="tag-list-create",
    ),

    path(
        "tags/<int:pk>/",
        TagDetailView.as_view(),
        name="tag-detail",
    ),
]