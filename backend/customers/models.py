from django.db import models
from django.core.exceptions import ValidationError

def validate_file_type(value):
    valid_mime_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']
    import os

    ext = os.path.splitext(value.name)[1].lower()

    if hasattr(value, 'content_type'):
        if value.content_type not in valid_mime_types and ext not in valid_extensions:
            raise ValidationError("Only PDF and image files are allowed.")
    else:
        if ext not in valid_extensions:
            raise ValidationError("Only PDf and image files are allowed.")

# Create your models here.
class Customer(models.Model):
    # Basic Holder Information
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Documents
    memorandum_of_agreement = models.FileField(
        upload_to='memorandums/', 
        validators=[validate_file_type],
        blank=True, 
        null=True,
        help_text='Upload memorandum of agreement (PDF or image format)'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def get_total_deceased_count(self):
        """Get total number of deceased across all niches for this holder"""
        return sum(niche.deceased_records.count() for niche in self.niches.all())
    
    def has_deceased(self):
        """Check if this holder has any deceased across all their niches"""
        return self.get_total_deceased_count() > 0
    
    def has_expiring_niches(self):
        """Check if this holder has any niches expiring within one year"""
        for niche in self.niches.all():
            if niche.is_expiring_soon():
                return True
        return False
    
    def get_earliest_expiry_days(self):
        """Get the number of days until the earliest expiring niche"""
        earliest_days = None
        for niche in self.niches.all():
            days = niche.days_until_expiry()
            if days is not None:
                if earliest_days is None or days < earliest_days:
                    earliest_days = days
        return earliest_days
