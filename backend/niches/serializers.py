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
    
    class Meta:
        model = Niche
        fields = '__all__'
        read_only_fields = ('status', 'created_at', 'updated_at')  # Make status read-only
    
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
    
    class Meta:
        model = Niche
        fields = ['id', 'location', 'niche_type', 'status', 'amount', 'holder', 'holder_name', 'deceased_count', 'created_at']
        read_only_fields = ('status',)  # Make status read-only in list view too


class NicheIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niche
        fields = ["id"]