from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Payment
from users.models import User
from user_sessions.models import Session
from .serializers import PaymentSerializer
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.utils import timezone

# Create your views here.
@api_view(['GET'])
@csrf_exempt
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
                payments = Payment.objects.all().order_by('-payment_date')

                serializer = PaymentSerializer(payments, many=True)
                print(serializer.data)
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to view these records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['POST'])
@requires_csrf_token
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
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"error": "You do not have permission to add records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['DELETE'])
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

                return Response({"message": "Payment records deleted successfully."}, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to delete records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['PUT'])
@requires_csrf_token
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
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)