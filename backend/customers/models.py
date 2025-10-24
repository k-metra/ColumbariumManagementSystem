from django.db import models

# Create your models here.
class Customer(models.Model):
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    deceased_name = models.CharField(max_length=255, blank=True, null=True)
    deceased_date = models.DateField(blank=True, null=True)
    relationship_to_deceased = models.CharField(max_length=255, blank=True, null=True)
    memorandum_of_agreement = models.ImageField(
        upload_to='memorandums/', 
        blank=True, 
        null=True,
        help_text='Upload memorandum of agreement (PNG or JPG format)'
    )

    def __str__(self):
        return self.name