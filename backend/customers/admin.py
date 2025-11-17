from django.contrib import admin
from .models import Customer

# Register your models here.
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'contact_number', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'email')
    readonly_fields = ('id', 'created_at', 'updated_at')
