from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    niche_count = serializers.SerializerMethodField()
    total_deceased_count = serializers.SerializerMethodField()
    contactNumber = serializers.CharField(source='contact_number', read_only=True)  # Frontend compatibility
    
    class Meta:
        model = Customer
        fields = '__all__'
    
    def get_niche_count(self, obj):
        """Get the number of niches owned by this customer"""
        return obj.niches.count()
    
    def get_total_deceased_count(self, obj):
        """Get the total number of deceased across all niches owned by this customer"""
        return sum(niche.deceased_records.count() for niche in obj.niches.all())

class CustomerSerializerNames(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['name']