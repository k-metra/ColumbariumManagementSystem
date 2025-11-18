from rest_framework import serializers
from .models import Niche, Deceased
from customers.models import Customer


class DeceasedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deceased
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class NicheSerializer(serializers.ModelSerializer):
    deceased_records = DeceasedSerializer(many=True, read_only=True)
    deceased_count = serializers.ReadOnlyField(source='get_deceased_count')
    holder_name = serializers.ReadOnlyField(source='holder.name')
    days_until_expiry = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    
    class Meta:
        model = Niche
        fields = '__all__'
        read_only_fields = ('status', 'date_of_expiry', 'created_at', 'updated_at')  # Keep expiry read-only since it's auto-calculated
    
    def get_days_until_expiry(self, obj):
        """Get number of days until expiry"""
        return obj.days_until_expiry()
    
    def get_is_expiring_soon(self, obj):
        """Check if niche is expiring soon"""
        return obj.is_expiring_soon()
    
    def validate(self, data):
        """Validate that customer doesn't exceed 4 niches"""
        holder = data.get('holder')
        if holder:
            # Count existing niches for this holder (excluding current niche if updating)
            existing_count = Niche.objects.filter(holder=holder).count()
            if self.instance:  # If updating, exclude current instance
                existing_count -= 1
            
            if existing_count >= 4:
                raise serializers.ValidationError("A holder can have a maximum of 4 niches.")
        
        return data


class NicheListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing niches without nested deceased records"""
    deceased_count = serializers.ReadOnlyField(source='get_deceased_count')
    holder_name = serializers.ReadOnlyField(source='holder.name')
    days_until_expiry = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    
    class Meta:
        model = Niche
        fields = ['id', 'location', 'niche_type', 'status', 'holder', 'holder_name', 'deceased_count', 'date_of_availment', 'date_of_expiry', 'days_until_expiry', 'is_expiring_soon', 'created_at']
        read_only_fields = ('status', 'date_of_expiry', 'days_until_expiry', 'is_expiring_soon')  # Make calculated fields read-only

    def get_days_until_expiry(self, obj):
        """Get number of days until expiry"""
        return obj.days_until_expiry()
    
    def get_is_expiring_soon(self, obj):
        """Check if niche is expiring soon"""
        return obj.is_expiring_soon()


class NicheIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niche
        fields = ["id"]