from django.db import models

# Create your models here.
class Occupant(models.Model):
    name = models.CharField(max_length=100)
    interment_date = models.DateField(default=models.functions.Now)
    niche = models.CharField(max_length=50)

    def __str__(self):
        return self.name