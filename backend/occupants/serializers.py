from rest_framework import serializers
from .models import Occupant

class OccupantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occupant
        fields = '__all__'