from rest_framework import serializers
from .models import User
from roles.models import Role
from roles.serializers import RoleField

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'permissions', 'role']

    def get_permissions(self, obj):
        if not obj.role:
            return []
        
        return list(obj.role.permissions.values_list('code', flat=True))
    
class UserCreateSerializer(serializers.ModelSerializer):
    role = RoleField(queryset=Role.objects.all())

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            role=validated_data.get('role')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
