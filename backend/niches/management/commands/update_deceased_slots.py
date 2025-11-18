from django.core.management.base import BaseCommand
from niches.models import Deceased

class Command(BaseCommand):
    help = 'Set default slot values for existing deceased records'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to update deceased records...'))
        
        # Get deceased records without slot values (where slot is the default '1' from migration)
        deceased_records = Deceased.objects.filter(slot='1')
        
        updated_count = 0
        
        for deceased in deceased_records:
            # Set to 'Upper Left' as the default
            deceased.slot = 'Upper Left'
            deceased.save(update_fields=['slot'])
            updated_count += 1
            self.stdout.write(f'Updated deceased: {deceased.name} -> Upper Left slot')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} deceased records with slot positions.'
            )
        )