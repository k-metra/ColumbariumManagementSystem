from django.db import models
from django.db.models import Sum
from datetime import datetime
from decimal import Decimal

# Create your models here.
class Payment(models.Model):
    payer = models.CharField(max_length=100)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    maintenance_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, editable=False) # status is either Completed, Pending or Inactive

    def __str__(self):
        return f"Payment record for {self.payer} - Due: {self.amount_due}"
    
    @property
    def amount_paid(self):
        """Calculate total amount paid from all payment details"""
        total = self.payment_details.aggregate(total=Sum('amount'))['total']
        return Decimal(str(total or 0.00))
    
    @property
    def remaining_balance(self):
        """Calculate remaining balance"""
        return max(Decimal('0'), self.amount_due - self.amount_paid)
    
    @property
    def last_payment_date(self):
        """Get the most recent payment date"""
        latest_payment = self.payment_details.order_by('-payment_date').first()
        return latest_payment.payment_date if latest_payment else None
    
    @property
    def months_paid(self):
        """Calculate how many months have been paid based on maintenance fee"""
        if self.maintenance_fee <= 0:
            return 0
        return int(self.amount_paid // self.maintenance_fee)
    
    @property
    def is_current_month_paid(self):
        """Check if current month is paid"""
        return self.months_paid > 0
    
    def save(self, *args, **kwargs):
        # Update status based on payment amounts
        if self.pk is not None:
        
            amount_paid = self.amount_paid
            remaining = self.amount_due - amount_paid
        
            if remaining <= Decimal('0'):
                self.status = "Completed"
            elif amount_paid > Decimal('0'):
                self.status = "Pending"
            else:
                self.status = "Inactive"
        else:
            if not self.status:
                self.status = "Inactive"

        super().save(*args, **kwargs)
  

class PaymentDetail(models.Model):
    """Individual payment transactions"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payment_details')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(default=datetime.now)
    created_by = models.CharField(max_length=100, blank=True, null=True)  # Track who added the payment
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment of {self.amount} on {self.payment_date.strftime('%Y-%m-%d')}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the parent payment status after saving payment detail
        # Use update() to avoid recursion and directly trigger the parent's save logic
        self.payment.save()
