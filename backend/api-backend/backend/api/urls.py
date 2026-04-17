from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'components', views.ComponentViewSet)
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'repair-orders', views.RepairOrderViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'revenue', views.RevenueViewSet, basename='revenue')

urlpatterns = [
    path('', include(router.urls)),
]