from django.contrib import admin
from .models import Niche, Deceased

@admin.register(Niche)
class NicheAdmin(admin.ModelAdmin):
    list_display = ('location', 'holder', 'niche_type', 'status', 'get_deceased_count', 'created_at')
    list_filter = ('status', 'niche_type', 'created_at')
    search_fields = ('location', 'holder__name')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_deceased_count(self, obj):
        return obj.get_deceased_count()
    get_deceased_count.short_description = 'Deceased Count'

@admin.register(Deceased)
class DeceasedAdmin(admin.ModelAdmin):
    list_display = ('name', 'niche', 'date_of_death', 'interment_date', 'relationship_to_holder')
    list_filter = ('relationship_to_holder', 'date_of_death', 'interment_date', 'created_at')
    search_fields = ('name', 'niche__location', 'niche__holder__name')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('niche__holder')
