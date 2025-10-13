from django.db import models
from niches.models import Niche
from django.dispatch import receiver
from django.db.models.signals import post_delete

# Create your models here.
class Occupant(models.Model):
    name = models.CharField(max_length=100)
    interment_date = models.DateField(default=models.functions.Now)
    niche = models.ForeignKey(Niche, on_delete=models.CASCADE, related_name='occupants')

    def __str__(self):
        return self.name
    
@receiver(post_delete, sender=Occupant)
def set_available_on_delete(sender, instance, **kwargs):
    if instance.niche:
        niche = instance.niche
        niche.status = "Available"
        niche.save()
