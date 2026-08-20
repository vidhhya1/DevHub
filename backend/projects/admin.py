from django.contrib import admin

from .models import Project, ProjectMember


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "owner",
        "visibility",
        "created_at",
    )

    list_filter = (
        "visibility",
        "created_at",
    )

    search_fields = (
        "name",
        "owner__username",
    )

    ordering = (
        "-created_at",
    ) 
     
@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):

    list_display = (
        "project",
        "user",
        "role",
    )

    list_filter = (
        "role",
    )

    search_fields = (
        "project__name",
        "user__username",
    )