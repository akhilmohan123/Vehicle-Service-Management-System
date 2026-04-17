from rest_framework import serializers
from .models import Component, Vehicle, RepairOrder, RepairItem, Payment

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class RepairItemSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    component_name = serializers.CharField(source='component.name', read_only=True, default='')
    
    class Meta:
        model = RepairItem
        fields = '__all__'
        # Make repair_order read-only since it's set from the URL
        read_only_fields = ('repair_order', 'total_price')

class RepairOrderSerializer(serializers.ModelSerializer):
    repair_items = RepairItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = RepairOrder
        fields = '__all__'
        

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('transaction_id', 'payment_date')