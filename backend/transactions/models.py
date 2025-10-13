from django.db import models
from accounts.models import Account
from users.models import User

# Create your models here.
class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=50)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Transaction {self.id} - {self.type} for {self.account.customer_name}"