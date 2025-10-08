from django.db import models

# Create your models here.
class Payment(models.Model):
    payer = models.CharField(max_length=100)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(default=models.functions.Now)
    status = models.CharField(max_length=50) # status is either Completed, Pending or Inactive

    def __str__(self):
        return f"Payment by {self.payer} of {self.amount_paid} on {self.payment_date.strftime('%Y-%m-%d %H:%M:%S')}"
    
    def save(self, *args, **kwargs):
        # Automatically update status before updating:
        if self.amount_paid >= self.amount_due:
            self.status = "Completed"
        elif self.amount_paid > 0:
            self.status = "Pending"
        else:
            self.status = "Inactive"
        
        self.amount_paid = min(self.amount_paid, self.amount_due)  # Prevent overpayment
        super().save(*args, **kwargs)
