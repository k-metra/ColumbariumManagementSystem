from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Payment, PaymentDetail

# Serializer for Payment model
class PaymentSerializer(ModelSerializer):
    amount_paid = SerializerMethodField()
    remaining_balance = SerializerMethodField()
    last_payment_date = SerializerMethodField()
    months_paid = SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = ['id', 'payer', 'amount_due', 'maintenance_fee', 'status', 
                 'amount_paid', 'remaining_balance', 'last_payment_date', 'months_paid']
        read_only_fields = ['status', 'amount_paid', 'remaining_balance', 'last_payment_date', 'months_paid']
    
    def get_amount_paid(self, obj):
        return float(obj.amount_paid)
    
    def get_remaining_balance(self, obj):
        return float(obj.remaining_balance)
    
    def get_last_payment_date(self, obj):
        return obj.last_payment_date
    
    def get_months_paid(self, obj):
        return obj.months_paid


class PaymentDetailSerializer(ModelSerializer):
    class Meta:
        model = PaymentDetail
        fields = '__all__'