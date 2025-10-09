from .models import AuditLog
from django.contrib.contenttypes.models import ContentType

def log_action(user, instance, action, description="", ip=None):
    AuditLog.objects.create(
        user=user,
        action=action,
        app_name=instance._meta.app_label,
        model_name=instance.__class__.__name__,
        object_id = str(instance.pk) if instance.pk else "undefined ID",
        content_type=ContentType.objects.get_for_model(instance),
        description = description,
        ip_address = ip,
    )