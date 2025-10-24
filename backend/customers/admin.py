from django.contrib import admin
from .models import Customer

# Register your models here.
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'contact_number', 'deceased_name')
    list_filter = ('deceased_date', 'relationship_to_deceased')
    search_fields = ('name', 'email', 'deceased_name')
    readonly_fields = ('id',)
