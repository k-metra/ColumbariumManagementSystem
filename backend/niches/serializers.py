from rest_framework import serializers
from .models import Niche

class NicheSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niche
        fields = "__all__"

class NicheIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niche
        fields = ["id"]