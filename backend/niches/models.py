from django.db import models
from django.core.exceptions import ValidationError
from customers.models import Customer

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
            raise ValidationError("Only PDF and image files are allowed.")

# Create your models here.
class Niche(models.Model):
    # Owner relationship
    holder = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='niches')
    
    # Niche details
    location = models.CharField(max_length=255, help_text='Location of the niche (e.g., Section A, Row 1, Column 3)')
    niche_type = models.CharField(max_length=50, default='Granite', choices=[
        ('Granite', 'Granite'),
        ('Glass', 'Glass'),
    ])
    status = models.CharField(max_length=50, default='Available', choices=[
        ('Available', 'Available'),
        ('Occupied', 'Occupied'),
        ('Full', 'Full'),
        ('Maintenance', 'Maintenance'),
        ('Reserved', 'Reserved'),
    ])
    max_deceased = models.PositiveIntegerField(default=4, help_text='Maximum number of deceased allowed in this niche')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['holder', 'location']  # Prevent duplicate locations for same holder
        
    def __str__(self):
        return f"{self.holder.name} - {self.location} ({self.status})"
    
    def get_deceased_count(self):
        """Get current number of deceased in this niche"""
        if not self.pk:
            return 0
        return self.deceased_records.count()
    
    def is_full(self):
        """Check if niche has reached maximum capacity"""
        return self.get_deceased_count() >= self.max_deceased
    
    def update_status(self):
        """Update status based on deceased count"""
        # Only update status if the niche has been saved and has a primary key
        if not self.pk:
            self.status = 'Available'
            return
            
        deceased_count = self.get_deceased_count()
        if deceased_count == 0:
            self.status = 'Available'
        elif deceased_count >= self.max_deceased:
            self.status = 'Full'
        else:
            self.status = 'Occupied'
    
    def save(self, *args, **kwargs):
        # Validate niche limit per holder
        if not self.pk:  # Only check on creation
            existing_niches = Niche.objects.filter(holder=self.holder).count()
            if existing_niches >= 4:
                raise ValidationError("Each holder can have a maximum of 4 niches.")
            
            # For new instances, set status to Available since there can't be any deceased yet
            self.status = 'Available'
        else:
            # For existing instances, update status based on current deceased count
            self.update_status()
        
        super().save(*args, **kwargs)


class Deceased(models.Model):
    # Niche relationship
    niche = models.ForeignKey(Niche, on_delete=models.CASCADE, related_name='deceased_records')
    
    # Deceased Information
    name = models.CharField(max_length=255, help_text='Name of the deceased')
    date_of_birth = models.DateField(blank=True, null=True)
    date_of_death = models.DateField(blank=True, null=True)
    interment_date = models.DateField(blank=True, null=True, help_text='Date when remains were placed in niche')
    
    # Relationship to holder
    relationship_to_holder = models.CharField(max_length=50, blank=True, null=True, choices=[
        ('Self', 'Self'),
        ('Spouse', 'Spouse'),
        ('Child', 'Child'),
        ('Parent', 'Parent'),
        ('Sibling', 'Sibling'),
        ('Grandchild', 'Grandchild'),
        ('Grandparent', 'Grandparent'),
        ('Other Family', 'Other Family Member'),
        ('Friend', 'Friend'),
        ('Other', 'Other'),
    ])
    
    # Documents
    death_certificate = models.FileField(
        upload_to='death_certificates/', 
        validators=[validate_file_type],
        blank=True, 
        null=True,
        help_text='Upload death certificate (PDF or image format)'
    )
    
    # Additional Information
    notes = models.TextField(blank=True, null=True, help_text='Additional notes or information')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['interment_date', 'created_at']
        
    def __str__(self):
        return f"{self.name} - {self.niche.location}"
    
    def clean(self):
        """Validate that niche doesn't exceed maximum capacity"""
        if self.niche_id:
            # Count existing deceased records for this niche (excluding current record if updating)
            existing_count = Deceased.objects.filter(niche=self.niche).exclude(pk=self.pk).count()
            
            if existing_count >= self.niche.max_deceased:
                raise ValidationError(f"This niche has reached its maximum capacity of {self.niche.max_deceased} deceased records.")
    
    def save(self, *args, **kwargs):
        # Validate before saving
        self.clean()
        super().save(*args, **kwargs)
        
        # Update niche status after saving deceased record
        if self.niche_id:
            # Refresh the niche from database to get updated relationships
            niche = Niche.objects.get(pk=self.niche_id)
            niche.update_status()
            niche.save()
    
    def delete(self, *args, **kwargs):
        niche_id = self.niche_id
        super().delete(*args, **kwargs)
        
        # Update niche status after deletion
        if niche_id:
            try:
                niche = Niche.objects.get(pk=niche_id)
                niche.update_status()
                niche.save()
            except Niche.DoesNotExist:
                pass  # Niche might have been deleted