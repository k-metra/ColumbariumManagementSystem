from django.db import models

# Create your models here.
class Niche(models.Model):
    amount = models.PositiveIntegerField()
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='Available') # available, occupied, maintenance, reserved
    max_occupants = models.PositiveIntegerField(default=2)
    type = models.CharField(max_length=50, default='Granite') # Granite, Glass, etc.

    def __str__(self):
        return f"{self.amount} - {self.location} ({self.status})"
    
    def update_status(self):
        """Update status based on occupant count"""
        occupant_count = self.occupants.count()
        if occupant_count == 0:
            self.status = 'Available'
        elif occupant_count >= self.max_occupants:
            self.status = 'Full'
        else:
            self.status = 'Occupied'
    
    def save(self, *args, **kwargs):
        # Don't auto-update status on initial creation (when pk is None)
        # because occupants relationship won't exist yet
        if self.pk is not None:
            self.update_status()
        super().save(*args, **kwargs)