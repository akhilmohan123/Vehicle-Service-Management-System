import uuid
from django.db import models
from django.utils import timezone

class Component(models.Model):
    COMPONENT_TYPES = [
        ('ENGINE', 'Engine'),
        ('TRANSMISSION', 'Transmission'),
        ('BRAKE', 'Brake System'),
        ('SUSPENSION', 'Suspension'),
        ('ELECTRICAL', 'Electrical System'),
        ('BATTERY', 'Battery'),
        ('TIRE', 'Tire'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    component_type = models.CharField(max_length=50, choices=COMPONENT_TYPES)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    repair_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ('CAR', 'Car'),
        ('TRUCK', 'Truck'),
        ('SUV', 'SUV'),
        ('MOTORCYCLE', 'Motorcycle'),
        ('VAN', 'Van'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration_number = models.CharField(max_length=50, unique=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    vehicle_type = models.CharField(max_length=50, choices=VEHICLE_TYPES)
    owner_name = models.CharField(max_length=200)
    owner_phone = models.CharField(max_length=20)
    owner_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.registration_number} - {self.make} {self.model}"

class RepairOrder(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='repair_orders')
    issue_description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    @property
    def total_amount(self):
        total = 0
        for item in self.repair_items.all():
            total += item.unit_price * item.quantity + item.labor_cost
        return total
    
    def __str__(self):
        return f"Repair Order #{str(self.id)[:8]}"

class RepairItem(models.Model):
    ACTION_TYPES = [
        ('REPAIR', 'Repair Service'),
        ('PURCHASE', 'Purchase New Component'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repair_order = models.ForeignKey(RepairOrder, on_delete=models.CASCADE, related_name='repair_items')
    component = models.ForeignKey(Component, on_delete=models.CASCADE, null=True, blank=True)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.CharField(max_length=500)
    
    @property
    def total_price(self):
        return (self.unit_price * self.quantity) + self.labor_cost
    
    def __str__(self):
        return f"Item: {self.description} (Order #{str(self.repair_order.id)[:8]})"

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repair_order = models.ForeignKey(RepairOrder, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Payment for Order #{str(self.repair_order.id)[:8]} - ${self.amount}"