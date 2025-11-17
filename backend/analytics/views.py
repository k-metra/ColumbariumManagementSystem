from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from customers.models import Customer
from niches.models import Niche, Deceased
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
        # 1. Holder Status Data (with deceased vs without deceased)
        total_holders = Customer.objects.count()
        
        # Count holders with deceased information (check if they have any deceased across all their niches)
        # Get holders who have at least one deceased record across all their niches
        holders_with_deceased = Customer.objects.filter(
            niches__deceased_records__isnull=False
        ).distinct().count()
        
        holders_without_deceased = total_holders - holders_with_deceased
        
        # Calculate deceased rate
        deceased_rate = round((holders_with_deceased / total_holders * 100), 2) if total_holders > 0 else 0
        
        holder_status_data = {
            'with_deceased': holders_with_deceased,
            'without_deceased': holders_without_deceased,
            'total': total_holders,
            'deceased_rate': deceased_rate
        }
        
        # 2. Additional KPI Data
        # Count occupied niches (those with status 'Occupied' or 'Full')
        occupied_niches = Niche.objects.filter(status__in=['Occupied', 'Full']).count()
        
        # Count total deceased records
        total_deceased = Deceased.objects.count()
        
        kpi_data = {
            'total_customers': total_holders,
            'occupied_niches': occupied_niches,
            'total_deceased': total_deceased,
        }
        
        return Response({
            'holder_status': holder_status_data,
            'kpi': kpi_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error fetching analytics data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)