from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

from niches.models import Niche
from payments.models import Payment, PaymentDetail
from customers.models import Customer
from occupants.models import Occupant
from user_sessions.utils import verify_session, get_user_from_session


@api_view(['GET'])
def get_analytics_data(request):
    """Get all analytics data for the dashboard"""
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not verify_session(authorization_header):
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    if not user.has_permission("view_dashboard"):
        return Response({"error": "You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # 1. Occupancy Rate Data
        total_niches = Niche.objects.count()
        occupied_niches = Niche.objects.filter(status='Occupied').count()
        full_niches = Niche.objects.filter(status='Full').count()
        available_niches = Niche.objects.filter(status='Available').count()
        
        # Total occupied includes both 'Occupied' and 'Full' for rate calculation
        total_occupied = occupied_niches + full_niches
        
        occupancy_data = {
            'occupied': occupied_niches,
            'full': full_niches,
            'available': available_niches,
            'total': total_niches,
            'occupancy_rate': round((total_occupied / total_niches * 100), 2) if total_niches > 0 else 0
        }
        
        # 2. Total Earnings
        total_earnings = PaymentDetail.objects.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # 3. Monthly Earnings (current month)
        now = timezone.now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_earnings = PaymentDetail.objects.filter(
            payment_date__gte=current_month_start
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # 4. Customer Count
        total_customers = Customer.objects.count()
        
        # 5. Occupant Count
        total_occupants = Occupant.objects.count()
        
        # Additional KPI data
        kpi_data = {
            'total_niches': total_niches,
            'occupied_niches': occupied_niches,
            'full_niches': full_niches,
            'available_niches': available_niches,
            'total_customers': total_customers,
            'total_occupants': total_occupants
        }
        
        return Response({
            'occupancy': occupancy_data,
            'total_earnings': float(total_earnings),
            'monthly_earnings': float(monthly_earnings),
            'kpi': kpi_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error fetching analytics data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)