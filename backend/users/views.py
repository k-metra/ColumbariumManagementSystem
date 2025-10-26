from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import User
from user_sessions.models import Session
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie
from django.middleware.csrf import get_token

from .serializers import UserSerializer, UserCreateSerializer

from user_sessions.utils import verify_session, get_user_from_session

# Create your views here.
@api_view(['POST'])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)

        if user.password != password:
            return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
        
        user_session = Session.objects.filter(user=user).first()

        if user_session:
            user_session.delete()
            print("Deleted session. Making new one...")
            user_session = Session.create_session(user)
        else: user_session = Session.create_session(user)

        user_session.save()
        serialized = UserSerializer(user, many=False)
        print(serialized.data)   
        return Response({"message": "Login successful.", "session_token": user_session.session_token, "user": serialized.data}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
def logout_view(request):
    authorization_header = request.headers.get("Authorization", "")
    if authorization_header.startswith("Session "):
        token = authorization_header.split(" ")[1]
        try:
            session = Session.objects.get(session_token=token)
            session.delete()
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session."}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"error": "Authorization header missing."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@requires_csrf_token
def create_user(request):
    if request.method == 'POST':
        authorization_header = request.headers.get('Authorization')

        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({"error":"Session is invalid or expired."}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_user_from_session(authorization_header)

        if not user:
            return Response({"error":f"No user associated with token {authorization_header} was found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.has_permission("manage_users") or not user.has_permission("view_dashboard"):
            return Response({"error":"You do not have permission to manage users."}, status=status.HTTP_403_FORBIDDEN)
        
        new_user = UserCreateSerializer(data=request.data)

        if new_user.is_valid():
            new_user.save()

            return Response({"ids": [new_user.data.get('id')]}, status=status.HTTP_201_CREATED)
        
        print(new_user.errors)
        return Response(new_user.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@ensure_csrf_cookie
def list_users(request):
    if request.method == 'GET':
        authorization_header = request.headers.get('Authorization')

        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({"error":"Session is invalid or expired."}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_user_from_session(authorization_header)

        if not user:
            return Response({"error":f"No user associated with token {authorization_header} was found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.has_permission("manage_users") or not user.has_permission("view_dashboard"):
            return Response({"error":"You do not have permission to view users."}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all()
        serialized = UserSerializer(users, many=True)

        return Response(serialized.data, status=status.HTTP_200_OK)
    
@api_view(['DELETE'])
@requires_csrf_token
def delete_user(request):
    if request.method == 'DELETE':
        authorization_header = request.headers.get('Authorization')

        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({"error":"Session is invalid or expired."}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_user_from_session(authorization_header)

        if not user:
            return Response({"error":f"No user associated with token {authorization_header} was found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.has_permission("manage_users") or not user.has_permission("view_dashboard"):
            return Response({"error":"You do not have permission to delete users."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user_ids = request.data.get('element_ids')
            for user_to_delete in user_ids:
                try:
                    user_instance = User.objects.get(id=user_to_delete)
                    user_instance.delete()
                except User.DoesNotExist:
                    return Response({"error":f"User with ID {user_to_delete} not found."}, status=status.HTTP_404_NOT_FOUND)

            
            return Response({"ids": user_ids}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error":"User not found."}, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['PUT'])
@requires_csrf_token
def edit_user(request):
    if request.method == 'PUT':
        authorization_header = request.headers.get('Authorization')

        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({"error":"Session is invalid or expired."}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_user_from_session(authorization_header)

        if not user:
            return Response({"error":f"No user associated with token {authorization_header} was found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.has_permission("manage_users") or not user.has_permission("view_dashboard"):
            return Response({"error":"You do not have permission to edit users."}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get("id")

        if not user_id:
            return Response({"error":"User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_to_edit = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error":"User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserCreateSerializer(user_to_edit, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"ids": [serializer.data.id]}, status=status.HTTP_200_OK)
        
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Get CSRF token for authenticated requests
    """
    csrf_token = get_token(request)
    return Response({"csrf_token": csrf_token}, status=status.HTTP_200_OK)