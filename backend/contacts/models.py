from django.db import models
from django.utils import timezone

# Create your models here.
class Contact(models.Model):
    family_name = models.CharField(max_length=100)
    deceased_name = models.CharField(max_length=100)
    deceased_date = models.DateField(auto_now_add=True)
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=15)
