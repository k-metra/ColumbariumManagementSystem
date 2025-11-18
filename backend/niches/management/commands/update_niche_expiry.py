from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from niches.models import Niche

class Command(BaseCommand):
    help = 'Update existing niches with current date as availment date and calculate expiry dates'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to update existing niches...'))
        
        # Get all niches that don't have a date_of_expiry set
        niches_to_update = Niche.objects.filter(date_of_expiry__isnull=True)
        
        count = 0
        for niche in niches_to_update:
            # Set availment date to now if it's still the default (creation time)
            # Calculate expiry as 50 years from availment
            niche.date_of_expiry = niche.calculate_expiry_date()
            niche.save(update_fields=['date_of_expiry'])
            count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {count} niches with expiry dates.'
            )
        )