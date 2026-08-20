from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from snippets.models import Snippet
from tasks.permissions import IsProjectMember

from .models import SnippetVersion
from .serializers import SnippetVersionSerializer


class VersionListView(
    generics.ListAPIView,
):

    serializer_class = SnippetVersionSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
    ]

    ordering = [
        "-version_number",
    ]

    def get_snippet(self):

        return get_object_or_404(
            Snippet,
            pk=self.kwargs["snippet_id"],
        )

    def get_queryset(self):

        return SnippetVersion.objects.filter(
            snippet=self.get_snippet(),
        ).select_related(
            "author",
            "snippet",
        )


class VersionDetailView(
    generics.RetrieveAPIView,
):

    serializer_class = SnippetVersionSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMember,
    ]

    def get_queryset(self):

        return SnippetVersion.objects.filter(
            snippet_id=self.kwargs["snippet_id"],
        ).select_related(
            "author",
            "snippet",
        )