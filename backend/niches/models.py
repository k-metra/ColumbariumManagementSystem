from django.db import models

# Create your models here.
class Niche(models.Model):
    amount = models.PositiveIntegerField()
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='available')  # available, occupied, maintenance

    def __str__(self):
        return f"{self.amount} - {self.location} ({self.status})"