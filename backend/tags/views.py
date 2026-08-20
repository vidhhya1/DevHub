from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Tag
from .serializers import TagSerializer


class TagListCreateView(
    generics.ListCreateAPIView,
):

    serializer_class = TagSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    queryset = Tag.objects.all()

    # PDF 3.6: "Tags can be listed and searched." The project-wide
    # SearchFilter is enabled in settings, but it only activates on a
    # view once search_fields is declared - without this, ?search=
    # was silently a no-op here.
    search_fields = [
        "name",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]


class TagDetailView(
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = TagSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    queryset = Tag.objects.all()