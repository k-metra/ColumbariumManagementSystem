from .models import Customer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie

from .serializers import CustomerSerializer, CustomerSerializerNames

from user_sessions.utils import verify_session, get_user_from_session

# Create your views here.
@api_view(['GET'])
def customer_list(request):
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)

    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    customers = Customer.objects.all()
    
    # Sort customers: expiring niches first, then by earliest expiry date, then by ID
    # This ensures consistent ordering where expiring customers always appear at the top
    customers_list = list(customers)
    customers_list.sort(key=lambda c: (
        not c.has_expiring_niches(),  # False sorts before True, so expiring comes first
        c.get_earliest_expiry_days() if c.get_earliest_expiry_days() is not None else float('inf'),  # Earliest expiry first
        c.id  # Fallback to ID for consistent ordering
    ))
    
    serializer = CustomerSerializer(customers_list, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def customer_list_names(request):
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)

    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    customers = Customer.objects.all()
    serializer = CustomerSerializerNames(customers, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@csrf_exempt
def create_customer(request):
    print(f"DEBUG: create_customer called with method: {request.method}")
    print(f"DEBUG: Headers: {dict(request.headers)}")
    print(f"DEBUG: Data: {request.data}")
    
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        print("DEBUG: No authorization header")
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)

    if not user.has_permission("add_record") or not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CustomerSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@csrf_exempt
def update_customer(request):
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)

    if not user.has_permission("edit_record") or not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    
    customer_id = request.GET.get("customer_id")

    if not customer_id:
        return Response({"error":"Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response({"error":"Customer not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CustomerSerializer(customer, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_200_OK)

    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@csrf_exempt
def delete_customers(request):
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)

    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)

    if not user.has_permission("delete_record") or not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

    customer_id = request.data.get("element_ids")

    if not customer_id:
        return Response({"error":"Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    deleted_ids = []

    for cid in customer_id:
        try:
            customer = Customer.objects.get(id=cid)
        except Customer.DoesNotExist:
            return Response({"error":f"Customer with ID {cid} not found."}, status=status.HTTP_404_NOT_FOUND)
        
        customer.delete()
        deleted_ids.append(cid)

    return Response({"ids": deleted_ids}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def search_by_deceased(request):
    """Search for customers/holders who have deceased records matching the query"""
    authorization_header = request.headers.get("Authorization")
    
    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    
    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    
    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    query = request.GET.get('query', '').strip()
    
    if not query:
        return Response([], status=status.HTTP_200_OK)
    
    try:
        # Import here to avoid circular imports
        from niches.models import Deceased
        
        # Find deceased records that match the query
        deceased_records = Deceased.objects.filter(
            name__icontains=query
        ).select_related('niche__holder')
        
        # Get unique holders/customers who have deceased matching the query
        holder_ids = set()
        for deceased in deceased_records:
            if deceased.niche and deceased.niche.holder:
                holder_ids.add(deceased.niche.holder.id)
        
        # Get the customer objects and serialize them
        customers = Customer.objects.filter(id__in=holder_ids)
        serializer = CustomerSerializer(customers, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error searching deceased records: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_expiring_soon_niches(request):
    """Get holders who have niches expiring within one year"""
    authorization_header = request.headers.get("Authorization")
    
    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    
    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    
    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get customers who have expiring niches, sorted by earliest expiry
        customers_with_expiring = []
        all_customers = Customer.objects.all()
        
        for customer in all_customers:
            if customer.has_expiring_niches():
                customers_with_expiring.append(customer)
        
        # Sort by earliest expiry date
        customers_with_expiring.sort(key=lambda c: c.get_earliest_expiry_days() or float('inf'))
        
        serializer = CustomerSerializer(customers_with_expiring, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error fetching expiring niches: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_recently_availed_niches(request):
    """Get the 3 most recently availed niches with their holders"""
    authorization_header = request.headers.get("Authorization")
    
    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    
    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    
    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from niches.models import Niche
        from niches.serializers import NicheListSerializer
        
        # Get the 3 most recently availed niches
        recent_niches = Niche.objects.select_related('holder').order_by('-date_of_availment')[:3]
        
        serializer = NicheListSerializer(recent_niches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error fetching recent niches: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_expired_niches(request):
    """Get holders who have expired niches"""
    authorization_header = request.headers.get("Authorization")
    
    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    
    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    
    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from django.utils import timezone
        
        # Get customers who have expired niches
        customers_with_expired = []
        all_customers = Customer.objects.all()
        current_time = timezone.now()
        
        for customer in all_customers:
            for niche in customer.niches.all():
                if niche.date_of_expiry and niche.date_of_expiry <= current_time:
                    customers_with_expired.append(customer)
                    break  # Only add customer once even if they have multiple expired niches
        
        serializer = CustomerSerializer(customers_with_expired, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error fetching expired niches: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_expired_niches_count(request):
    """Get count of expired niches for notification badge"""
    authorization_header = request.headers.get("Authorization")
    
    if not authorization_header:
        return Response({"error":"Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    
    if not is_session_valid:
        return Response({"error":"Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    
    if not user.has_permission("view_dashboard"):
        return Response({"error":"You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from django.utils import timezone
        from niches.models import Niche
        
        current_time = timezone.now()
        expired_count = Niche.objects.filter(
            date_of_expiry__lte=current_time
        ).count()
        
        return Response({"count": expired_count}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": f"Error fetching expired count: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
