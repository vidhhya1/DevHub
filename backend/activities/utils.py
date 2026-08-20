from .models import Activity


def log_activity(
    *,
    project,
    user,
    action,
    description,
    task=None,
):
    Activity.objects.create(
        project=project,
        user=user,
        task=task,
        action=action,
        description=description,
    )