from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    niche_count = serializers.SerializerMethodField()
    total_deceased_count = serializers.SerializerMethodField()
    contactNumber = serializers.CharField(source='contact_number', read_only=True)  # Frontend compatibility
    has_expiring_niches = serializers.SerializerMethodField()
    earliest_expiry_days = serializers.SerializerMethodField()
    expiry_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = '__all__'
    
    def get_niche_count(self, obj):
        """Get the number of niches owned by this customer"""
        return obj.niches.count()
    
    def get_total_deceased_count(self, obj):
        """Get the total number of deceased across all niches owned by this customer"""
        return sum(niche.deceased_records.count() for niche in obj.niches.all())
    
    def get_has_expiring_niches(self, obj):
        """Check if this customer has any niches expiring within one year"""
        return obj.has_expiring_niches()
    
    def get_earliest_expiry_days(self, obj):
        """Get the number of days until the earliest expiring niche"""
        return obj.get_earliest_expiry_days()
    
    def get_expiry_status(self, obj):
        """Get expiry status for UI display"""
        if obj.has_expiring_niches():
            days = obj.get_earliest_expiry_days()
            if days is not None:
                if days == 0:
                    return "EXPIRED"
                elif days <= 30:
                    return "CRITICAL"
                elif days <= 90:
                    return "WARNING" 
                else:
                    return "EXPIRING"
        return "NORMAL"

class CustomerSerializerNames(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['name']