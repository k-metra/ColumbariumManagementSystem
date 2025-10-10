from django.db import models

# Create your models here.
class Niche(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='available')  # available, occupied, reserved

    def __str__(self):
        return f"{self.name} - {self.location} ({self.status})"