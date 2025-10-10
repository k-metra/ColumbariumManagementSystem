from .models import Role
from rest_framework import serializers

class RoleField(serializers.RelatedField):
    def to_representation(self, value):
        return value.name
    
    def to_internal_value(self, data):
        try:
            return Role.objects.get(name=data.capitalize())
        except Role.DoesNotExist:
            raise serializers.ValidationError(f"Role {data.capitalize()} does not exist.")