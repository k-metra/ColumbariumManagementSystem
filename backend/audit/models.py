from django.db import models
from users.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.
class AuditLog(models.Model):
    '''ACTION_CHOICES = [
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("login", "Login"),
        ("logout", "Logout"),
        ("custom", "Custom"),
    ]'''
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    app = models.CharField(max_length=100, default="Undefined App")
    action = models.CharField(max_length=20, default="Undefined Action")
    path = models.CharField(max_length=255)
    method = models.CharField(max_length=10, default="Undefined Method")
    request_data = models.JSONField(null=True, blank=True) # User sent
    response_data = models.JSONField(null=True, blank=True) # server returned
    status_code = models.PositiveIntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] {self.user.username} - {self.action} - {self.app}"
