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
    serializer = CustomerSerializer(customers, many=True)

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