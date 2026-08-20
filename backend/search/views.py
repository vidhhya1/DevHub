from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from projects.models import Project
from tasks.models import Task
from snippets.models import Snippet
from tags.models import Tag


class GlobalSearchView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):

        query = request.query_params.get(
            "q",
            "",
        ).strip()

        if not query:
            return Response(
                {
                    "projects": [],
                    "tasks": [],
                    "snippets": [],
                    "tags": [],
                }
            )

        user = request.user

        # Only search inside projects the user can actually see:
        # public projects, plus private projects they own or belong to.
        visible_projects = Q(visibility=Project.Visibility.PUBLIC) | Q(
            owner=user
        ) | Q(members__user=user)

        projects = Project.objects.filter(visible_projects).filter(
            Q(name__icontains=query)
            | Q(description__icontains=query)
        ).distinct()[:5]

        tasks = Task.objects.filter(
            Q(project__visibility=Project.Visibility.PUBLIC)
            | Q(project__owner=user)
            | Q(project__members__user=user)
        ).filter(
            Q(title__icontains=query)
            | Q(description__icontains=query)
        ).distinct()[:5]

        snippets = Snippet.objects.filter(
            Q(project__visibility=Project.Visibility.PUBLIC)
            | Q(project__owner=user)
            | Q(project__members__user=user)
        ).filter(
            Q(title__icontains=query)
            | Q(description__icontains=query)
            | Q(code__icontains=query)
        ).distinct()[:5]

        # Tags are a project-agnostic reusable resource (per 3.6), so
        # they intentionally are not scoped to project membership.
        tags = Tag.objects.filter(
            name__icontains=query,
        )[:5]

        return Response(
            {
                "projects": [
                    {
                        "id": project.id,
                        "title": project.name,
                        "description": project.description,
                    }
                    for project in projects
                ],
                "tasks": [
                    {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                    }
                    for task in tasks
                ],
                "snippets": [
                    {
                        "id": snippet.id,
                        "title": snippet.title,
                        "description": snippet.description,
                    }
                    for snippet in snippets
                ],
                "tags": [
                    {
                        "id": tag.id,
                        "title": tag.name,
                    }
                    for tag in tags
                ],
            }
        )