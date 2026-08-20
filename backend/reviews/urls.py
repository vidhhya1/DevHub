from django.urls import path

from .views import (
    ReviewDetailView,
    ReviewListCreateView,
)

urlpatterns = [
    path(
        "tasks/<int:task_id>/reviews/",
        ReviewListCreateView.as_view(),
        name="review-list-create",
    ),
    path(
        "tasks/<int:task_id>/reviews/<int:pk>/",
        ReviewDetailView.as_view(),
        name="review-detail",
    ),
]