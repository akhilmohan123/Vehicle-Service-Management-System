"""
Views for the Vehicle Repair Management System API
This file contains all the API endpoints (views) that handle HTTP requests
Each ViewSet handles CRUD operations for a specific model
"""

# Import required modules
from rest_framework import viewsets, status  # viewsets for CRUD, status for HTTP codes
from rest_framework.decorators import action  # For custom actions beyond CRUD
from rest_framework.response import Response  # For sending HTTP responses
from django.db.models import Sum  # For summing revenue
from django.db.models.functions import TruncDate, TruncMonth, TruncYear  # For date grouping
from django.utils import timezone  # For current date/time
from datetime import timedelta  # For date calculations
from .models import Component, Vehicle, RepairOrder, RepairItem, Payment
from .serializers import *


class ComponentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Component CRUD operations
    ModelViewSet automatically provides: list, create, retrieve, update, delete
    URL: /api/components/
    """
    # Get all components from database
    queryset = Component.objects.all()
    # Use ComponentSerializer to convert model <-> JSON
    serializer_class = ComponentSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Vehicle CRUD operations
    Handles all vehicle-related API endpoints
    URL: /api/vehicles/
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class RepairOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Repair Order operations
    Includes custom actions for adding items, completing orders, and calculating totals
    URL: /api/repair-orders/
    """
    queryset = RepairOrder.objects.all()
    serializer_class = RepairOrderSerializer
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """
        Custom action to add a repair/purchase item to an existing repair order
        URL: POST /api/repair-orders/{order_id}/add_item/
        
        Parameters:
        - component: UUID of the component
        - action_type: 'REPAIR' or 'PURCHASE'
        - quantity: number of items
        - unit_price: price per unit
        - labor_cost: labor charges
        - description: item description
        """
        # Get the repair order from the URL parameter (pk)
        repair_order = self.get_object()
        
        # Create a mutable copy of the request data
        # Django's request.data is immutable, so we copy it
        data = request.data.copy()
        
        # Add the repair_order ID to the data
        # This is required because the serializer expects repair_order field
        data['repair_order'] = str(repair_order.id)
        
        # Create serializer with the data
        serializer = RepairItemSerializer(data=data)
        
        # Check if the data is valid
        if serializer.is_valid():
            # Save the item, automatically linking it to the repair_order
            serializer.save(repair_order=repair_order)
            # Return 201 Created with the serialized data
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If validation fails, print errors for debugging
        print("Serializer errors:", serializer.errors)
        # Return 400 Bad Request with error details
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Custom action to mark a repair order as completed
        URL: POST /api/repair-orders/{order_id}/complete/
        
        This updates the status to 'COMPLETED' and sets the completion timestamp
        """
        # Get the repair order from URL
        repair_order = self.get_object()
        
        # Update status to COMPLETED
        repair_order.status = 'COMPLETED'
        
        # Set the completion time to current timestamp
        repair_order.completed_at = timezone.now()
        
        # Save changes to database
        repair_order.save()
        
        # Return success response
        return Response({'status': 'completed'})
    
    @action(detail=True, methods=['get'])
    def calculate_total(self, request, pk=None):
        """
        Custom action to calculate the total amount for a repair order
        URL: GET /api/repair-orders/{order_id}/calculate_total/
        
        Returns the sum of all items (unit_price * quantity + labor_cost)
        """
        # Get the repair order
        repair_order = self.get_object()
        
        # Return the total amount (calculated by the model's property)
        return Response({'total_amount': repair_order.total_amount})


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment operations
    Overrides the create method to add business logic
    URL: /api/payments/
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Override the default create method to validate payment amount
        Ensures payment amount matches the repair order total
        Automatically marks payment as COMPLETED (simulated payment)
        """
        # Validate the incoming data using the serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the repair order ID from validated data
        repair_order_id = serializer.validated_data['repair_order'].id
        
        # Fetch the repair order from database
        repair_order = RepairOrder.objects.get(id=repair_order_id)
        
        # Business rule: Payment amount must equal repair order total
        if serializer.validated_data['amount'] != repair_order.total_amount:
            # Return error if amounts don't match
            return Response(
                {'error': f'Amount must equal ${repair_order.total_amount}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save the payment to database
        payment = serializer.save()
        
        # Simulate successful payment processing
        # In a real app, this would integrate with Stripe/PayPal
        payment.status = 'COMPLETED'
        payment.save()
        
        # Return success response with payment details
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RevenueViewSet(viewsets.ViewSet):
    """
    ViewSet for Revenue Analytics
    Provides endpoints for daily, monthly, and yearly revenue data
    These are used by the frontend Recharts graphs
    URL: /api/revenue/
    """
    
    @action(detail=False, methods=['get'])
    def daily(self, request):
        """
        Get daily revenue for the last 30 days
        URL: GET /api/revenue/daily/
        
        Used for: Daily revenue graph in the frontend
        Returns: List of {date: YYYY-MM-DD, revenue: amount}
        """
        # Calculate date range: today minus 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        # Query the database for completed payments in date range
        # Group by date using TruncDate, sum the amounts
        data = Payment.objects.filter(
            status='COMPLETED',  # Only completed payments
            payment_date__date__gte=start_date  # Last 30 days
        ).annotate(
            date=TruncDate('payment_date')  # Extract just the date part
        ).values('date').annotate(
            revenue=Sum('amount')  # Sum all amounts for each date
        ).order_by('date')  # Sort by date ascending
        
        # Convert QuerySet to list of dictionaries with formatted data
        # This ensures consistent format for the frontend
        result = []
        for item in data:
            result.append({
                'date': item['date'].isoformat() if item['date'] else None,  # Format as ISO string
                'revenue': float(item['revenue']) if item['revenue'] else 0  # Convert Decimal to float
            })
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def monthly(self, request):
        """
        Get monthly revenue for the last 12 months
        URL: GET /api/revenue/monthly/
        
        Used for: Monthly revenue bar chart in the frontend
        Returns: List of {date: YYYY-MM, revenue: amount}
        """
        # Calculate date range: today minus 365 days (1 year)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=365)
        
        # Query database, group by month using TruncMonth
        data = Payment.objects.filter(
            status='COMPLETED',
            payment_date__date__gte=start_date
        ).annotate(
            date=TruncMonth('payment_date')  # Group by month
        ).values('date').annotate(
            revenue=Sum('amount')
        ).order_by('date')
        
        # Format the response
        result = []
        for item in data:
            result.append({
                'date': item['date'].isoformat() if item['date'] else None,
                'revenue': float(item['revenue']) if item['revenue'] else 0
            })
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def yearly(self, request):
        """
        Get yearly revenue for the last 5 years
        URL: GET /api/revenue/yearly/
        
        Used for: Yearly revenue line chart in the frontend
        Returns: List of {date: YYYY, revenue: amount}
        """
        # Calculate date range: today minus 5 years
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=5*365)
        
        # Query database, group by year using TruncYear
        data = Payment.objects.filter(
            status='COMPLETED',
            payment_date__date__gte=start_date
        ).annotate(
            date=TruncYear('payment_date')  # Group by year
        ).values('date').annotate(
            revenue=Sum('amount')
        ).order_by('date')
        
        # Format the response
        result = []
        for item in data:
            result.append({
                'date': item['date'].isoformat() if item['date'] else None,
                'revenue': float(item['revenue']) if item['revenue'] else 0
            })
        return Response(result)