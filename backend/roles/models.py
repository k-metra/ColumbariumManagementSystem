from django.db import models

# Create your models here.
class Permission(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.code
    

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    permissions = models.ManyToManyField(Permission, related_name="roles")

    def __str__(self):
        return self.name
    