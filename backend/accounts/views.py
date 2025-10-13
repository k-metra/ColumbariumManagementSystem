from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from users.models import User
from .models import Account
from .serializers import AccountSerializer

from user_sessions.utils import verify_session, get_user_from_session

# Create your views here.

@api_view(['GET'])
def list_all(request):
    if request.method != 'GET':
        return Response({"error":"Invalid request method."}, status=status.HTTP_400_BAD_REQUEST)
    
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        return Response({"error": "Authorization header missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = get_user_from_session(authorization_header)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if not user.has_permission("view_dashboard"):
        return Response({"error": "You do not have permission to view accounts."}, status=status.HTTP_403_FORBIDDEN)
    
    accounts = AccountSerializer(Account.objects.all(), many=True).data
    return Response(accounts, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_account(request):
    if request.method != 'POST':
        return Response({"error":"Invalid request method."}, status=status.HTTP_400_BAD_REQUEST)
    
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        return Response({"error": "Authorization header missing."}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)

    if not is_session_valid:
        return Response({"error": "Invalid or expired session."}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = get_user_from_session(authorization_header)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if not user.has_permission("manage_dashboard"):
        return Response({"error": "You do not have permission to create accounts."}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = AccountSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




