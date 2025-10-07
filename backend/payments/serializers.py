from rest_framework.serializers import ModelSerializer
from .models import Payment

# Serializer for Payment model
class PaymentSerializer(ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'