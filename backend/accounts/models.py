from django.db import models
from customers.models import Customer

# Create your models here.
class Account(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)

    def __str__(self):
        return self.customer
    

