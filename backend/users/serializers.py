from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'permissions']

    def get_permissions(self, obj):
        if not obj.role:
            return []
        
        return list(obj.role.permissions.values_list('code', flat=True))