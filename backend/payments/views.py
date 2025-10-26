from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Payment, PaymentDetail
from users.models import User
from user_sessions.models import Session
from .serializers import PaymentSerializer, PaymentDetailSerializer
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie
from django.utils import timezone
from user_sessions.utils import verify_session, get_user_from_session

# Create your views here.
@api_view(['GET'])
def list_payments(request):
    if request.method == 'GET':
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

            session_expiry = user_session.expiry

            if timezone.now() > session_expiry:
                return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("view_records") and user.has_permission("view_dashboard"):
                payments = Payment.objects.all().order_by('-id')

                serializer = PaymentSerializer(payments, many=True)
            
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to view these records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['POST'])
@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

            session_expiry = user_session.expiry

            if timezone.now() > session_expiry:
                return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("add_record") and user.has_permission("view_dashboard"):
                data = request.data
                data["status"] = "Pending"  # Default status when creating a new payment
                print(data)
                serializer = PaymentSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"error": "You do not have permission to add records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['DELETE'])
@csrf_exempt
def delete_payment(request):
    if request.method == 'DELETE':
        payments = request.data.get("element_ids")
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

            session_expiry = user_session.expiry

            if timezone.now() > session_expiry:
                return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("delete_record") and user.has_permission("view_dashboard"):

                for id in payments:
                    print("Deleting id:", id)
                    try:
                        payment = Payment.objects.get(id=id)
                        payment.delete()
                    except Payment.DoesNotExist:
                        return Response({"error": f"Payment record with id {id} not found."}, status=status.HTTP_404_NOT_FOUND)

                return Response({"ids": payments}, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to delete records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['PUT'])
@csrf_exempt
def edit_payment(request):
    if request.method == 'PUT':
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        id = request.GET.get("payment_id")
        if not id:
            return Response({"error": "Payment ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        new_data = request.data

        try:
            payment = Payment.objects.get(id=id)
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

            session_expiry = user_session.expiry

            if session_expiry < timezone.now():
                return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            user = user_session.user
            if user.has_permission("edit_record") and user.has_permission("view_dashboard"):
                serializer = PaymentSerializer(payment, data=new_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_payment_details(request, payment_id):
    """Get all payment details for a specific payment"""
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not verify_session(authorization_header):
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    if not user.has_permission("view_dashboard"):
        return Response({"error": "You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        payment = Payment.objects.get(id=payment_id)
        payment_details = payment.payment_details.all()
        
        # Return both payment info and details
        payment_serializer = PaymentSerializer(payment)
        details_serializer = PaymentDetailSerializer(payment_details, many=True)
        
        return Response({
            "payment": payment_serializer.data,
            "details": details_serializer.data,
            "months_paid": payment.months_paid,
            "can_add_payment": payment.remaining_balance > 0
        }, status=status.HTTP_200_OK)
        
    except Payment.DoesNotExist:
        return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@csrf_exempt
def add_payment_detail(request, payment_id):
    """Add a new payment detail to an existing payment"""
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not verify_session(authorization_header):
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    if not user.has_permission("add_record") or not user.has_permission("view_dashboard"):
        return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        payment = Payment.objects.get(id=payment_id)
        
        # Check if payment is already completed
        if payment.remaining_balance <= 0:
            return Response({
                "error": "Payment is already completed. No additional payments can be added.",
                "type": "payment_completed"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate payment amount
        payment_amount = float(request.data.get('amount', 0))
        if payment_amount <= 0:
            return Response({"error": "Payment amount must be greater than 0."}, status=status.HTTP_400_BAD_REQUEST)
        
        if payment_amount > payment.remaining_balance:
            return Response({
                "error": f"Payment amount ({payment_amount}) cannot exceed remaining balance ({payment.remaining_balance}).",
                "type": "amount_exceeds_balance"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment detail
        data = request.data.copy()
        data['payment'] = payment_id
        data['created_by'] = user.username
        
        serializer = PaymentDetailSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            
            # Return updated payment info
            updated_payment = PaymentSerializer(payment).data
            return Response({
                "payment_detail": serializer.data,
                "updated_payment": updated_payment,
                "message": "Payment added successfully"
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Payment.DoesNotExist:
        return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@csrf_exempt
def edit_payment_detail(request, detail_id):
    """Edit a specific payment detail"""
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not verify_session(authorization_header):
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    if not user.has_permission("edit_record") or not user.has_permission("view_dashboard"):
        return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        payment_detail = PaymentDetail.objects.get(id=detail_id)
        
        # Validate payment amount
        payment_amount = float(request.data.get('amount', 0))
        if payment_amount <= 0:
            return Response({"error": "Payment amount must be greater than 0."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update payment detail
        data = request.data.copy()
        serializer = PaymentDetailSerializer(payment_detail, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "payment_detail": serializer.data,
                "message": "Payment detail updated successfully"
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except PaymentDetail.DoesNotExist:
        return Response({"error": "Payment detail not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@csrf_exempt
def delete_payment_detail(request, detail_id):
    """Delete a specific payment detail"""
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not verify_session(authorization_header):
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = get_user_from_session(authorization_header)
    if not user.has_permission("delete_record") or not user.has_permission("view_dashboard"):
        return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        payment_detail = PaymentDetail.objects.get(id=detail_id)
        payment_detail.delete()
        
        return Response({
            "message": "Payment detail deleted successfully"
        }, status=status.HTTP_200_OK)
        
    except PaymentDetail.DoesNotExist:
        return Response({"error": "Payment detail not found."}, status=status.HTTP_404_NOT_FOUND)