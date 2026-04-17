from django.contrib import admin
from .models import Component, Vehicle, RepairOrder, RepairItem, Payment

admin.site.register(Component)
admin.site.register(Vehicle)
admin.site.register(RepairOrder)
admin.site.register(RepairItem)
admin.site.register(Payment)