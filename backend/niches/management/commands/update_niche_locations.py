from django.core.management.base import BaseCommand
from niches.models import Niche
import re

class Command(BaseCommand):
    help = 'Remove slot positions from existing niche locations'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to update niche locations...'))
        
        # Pattern to match slot positions at the end of location strings
        slot_pattern = r'\s*–\s*(Upper Left|Upper Right|Lower Left|Lower Right)$'
        
        updated_count = 0
        niches = Niche.objects.all()
        
        for niche in niches:
            original_location = niche.location
            # Remove slot position from location
            new_location = re.sub(slot_pattern, '', original_location).strip()
            
            if new_location != original_location:
                niche.location = new_location
                niche.save(update_fields=['location'])
                updated_count += 1
                self.stdout.write(f'Updated: "{original_location}" -> "{new_location}"')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} niche locations.'
            )
        )