from django.core.management.base import BaseCommand
from niches.models import Niche

class Command(BaseCommand):
    help = 'Populate the database with all niche locations'

    def handle(self, *args, **options):
        # List of all niche locations from the image
        niche_locations = [
            "Wall 1 - Row 4 - Niche 2",
            "Wall 2 - Row 3 - Niche 1", 
            "Wall 1 - Row 2 - Niche 3",
            "Wall 4 - Row 4 - Niche 4",
            "Wall 3 - Row 3 - Niche 2",
            "Wall 4 - Row 2 - Niche 1",
            "Wall 1 - Row 3 - Niche 4"
        ]

        created_count = 0
        skipped_count = 0

        for location in niche_locations:
            # Check if niche already exists
            if not Niche.objects.filter(location=location).exists():
                Niche.objects.create(
                    location=location,
                    niche_type='Standard',  # Default type
                    status='Available',     # Default status for new niches
                    holder=None            # No holder initially
                )
                created_count += 1
                self.stdout.write(f"Created niche: {location}")
            else:
                skipped_count += 1
                self.stdout.write(f"Skipped existing niche: {location}")

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully processed {len(niche_locations)} niches:\n'
                f'- Created: {created_count}\n'
                f'- Skipped (already exists): {skipped_count}'
            )
        )