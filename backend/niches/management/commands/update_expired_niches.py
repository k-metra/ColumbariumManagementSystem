from django.core.management.base import BaseCommand
from django.utils import timezone
from niches.models import Niche

class Command(BaseCommand):
    help = 'Update status of expired niches to "Expired"'

    def handle(self, *args, **options):
        # Find all niches that have expired (date_of_expiry < now) but don't have Expired status
        now = timezone.now()
        expired_niches = Niche.objects.filter(
            date_of_expiry__lt=now,
            status__in=['Available', 'Reserved', 'Occupied', 'Full', 'Maintenance']
        )
        
        count = expired_niches.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No expired niches found that need status update.')
            )
            return
        
        # Update their status
        for niche in expired_niches:
            old_status = niche.status
            niche.update_status()  # This will set status to 'Expired' if expired
            niche.save()
            self.stdout.write(
                f'Updated niche {niche.id} ({niche.location}) from {old_status} to {niche.status}'
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {count} expired niches to "Expired" status.')
        )