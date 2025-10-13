from django.db import models

# Create your models here.
class Account(models.Model):
    customer_name = models.CharField(max_length=100)

    def __str__(self):
        return self.customer_name
    
    
