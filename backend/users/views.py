from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import User
from user_sessions.models import Session

from .serializers import UserSerializer

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
        return Response({"message": "Login successful.", "session_token": user_session.session_token, "user": serialized.data}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

