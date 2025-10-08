from django.db import models

# Create your models here.
class Payment(models.Model):
    payer = models.CharField(max_length=100)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(default=models.functions.Now)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50) # status is either Completed, Pending or Inactive

    def __str__(self):
        return f"Payment by {self.payer} of {self.amount_paid} on {self.payment_date.strftime('%Y-%m-%d %H:%M:%S')}"
    
    def save(self, *args, **kwargs):
        self.amount_paid = min(self.amount_paid, self.amount_due)  # Prevent overpayment
        self.remaining_balance = abs(self.amount_due - self.amount_paid)

        # Update status based on payment amounts
        self.status = "Completed" if self.remaining_balance == 0 else "Pending"

        # Status is rendered as 'Inactive' if amount paid is 0
        self.status = "Inactive" if self.amount_paid == 0 else self.status

        super().save(*args, **kwargs)
