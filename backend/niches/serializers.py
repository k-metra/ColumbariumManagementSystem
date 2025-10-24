from rest_framework import serializers
from .models import Niche

class NicheSerializer(serializers.ModelSerializer):
    occupant_count = serializers.SerializerMethodField()
    
    def get_occupant_count(self, obj):
        """Returns the count of occupants in this niche"""
        return obj.occupants.count()

    class Meta:
        model = Niche
        fields = "__all__"

class NicheIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niche
        fields = ["id"]