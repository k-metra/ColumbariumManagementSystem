import os
from django.core.management.base import BaseCommand
from django.conf import settings
from customers.models import Customer


class Command(BaseCommand):
    help = 'Clean up unused media files from death_certificates and memorandums directories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show which files would be deleted without actually deleting them',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No files will be deleted'))
        
        # Get all referenced files from the database
        customers = Customer.objects.all()
        referenced_files = set()
        
        for customer in customers:
            if customer.death_certificate:
                referenced_files.add(str(customer.death_certificate))
            if customer.memorandum_of_agreement:
                referenced_files.add(str(customer.memorandum_of_agreement))
        
        self.stdout.write(f'Found {len(referenced_files)} referenced files in database')
        
        # Check death_certificates directory
        death_cert_dir = os.path.join(settings.MEDIA_ROOT, 'death_certificates')
        deleted_count = 0
        total_size_saved = 0
        
        if os.path.exists(death_cert_dir):
            self.stdout.write('\nScanning death_certificates directory...')
            for filename in os.listdir(death_cert_dir):
                file_path = os.path.join(death_cert_dir, filename)
                relative_path = f'death_certificates/{filename}'
                
                if os.path.isfile(file_path) and relative_path not in referenced_files:
                    file_size = os.path.getsize(file_path)
                    total_size_saved += file_size
                    
                    if dry_run:
                        self.stdout.write(f'  Would delete: {relative_path} ({file_size} bytes)')
                    else:
                        try:
                            os.remove(file_path)
                            self.stdout.write(f'  Deleted: {relative_path} ({file_size} bytes)')
                            deleted_count += 1
                        except OSError as e:
                            self.stdout.write(self.style.ERROR(f'  Error deleting {relative_path}: {e}'))
        
        # Check memorandums directory
        memorandum_dir = os.path.join(settings.MEDIA_ROOT, 'memorandums')
        if os.path.exists(memorandum_dir):
            self.stdout.write('\nScanning memorandums directory...')
            for filename in os.listdir(memorandum_dir):
                file_path = os.path.join(memorandum_dir, filename)
                relative_path = f'memorandums/{filename}'
                
                if os.path.isfile(file_path) and relative_path not in referenced_files:
                    file_size = os.path.getsize(file_path)
                    total_size_saved += file_size
                    
                    if dry_run:
                        self.stdout.write(f'  Would delete: {relative_path} ({file_size} bytes)')
                    else:
                        try:
                            os.remove(file_path)
                            self.stdout.write(f'  Deleted: {relative_path} ({file_size} bytes)')
                            deleted_count += 1
                        except OSError as e:
                            self.stdout.write(self.style.ERROR(f'  Error deleting {relative_path}: {e}'))
        
        # Summary
        size_mb = total_size_saved / (1024 * 1024)
        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'\nDRY RUN SUMMARY: Would delete {deleted_count} files, saving {size_mb:.2f} MB'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\nCLEANUP COMPLETE: Deleted {deleted_count} files, saved {size_mb:.2f} MB'))