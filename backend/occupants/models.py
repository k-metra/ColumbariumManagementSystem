from django.db import models
from niches.models import Niche
from django.dispatch import receiver
from django.db.models.signals import post_delete, post_save

# Create your models here.
class Occupant(models.Model):
    name = models.CharField(max_length=100)
    interment_date = models.DateField(default=models.functions.Now)
    niche = models.ForeignKey(Niche, on_delete=models.CASCADE, related_name='occupants')

    def __str__(self):
        return self.name

@receiver(post_save, sender=Occupant)
def update_niche_status_on_save(sender, instance, **kwargs):
    """Update niche status when an occupant is created or updated"""
    if instance.niche:
        instance.niche.update_status()
        instance.niche.save()

@receiver(post_delete, sender=Occupant)
def update_niche_status_on_delete(sender, instance, **kwargs):
    """Update niche status when an occupant is deleted"""
    if instance.niche:
        instance.niche.update_status()
        instance.niche.save()
