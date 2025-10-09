from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True )

    class Meta:
        model = AuditLog
        fields = '__all__'