from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

from .models import Session
from django.utils import timezone

# Create your views here.
@api_view(['GET', 'POST'])
@csrf_exempt
def verify_token(request):
    return Response({'message': 'Token is valid'}, status=status.HTTP_200_OK)
    '''
    token = request.headers.get('Session-Token')
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Here you would typically verify the token with your authentication backend
    # Replace with actual token validation logic
    try:
        session = Session.objects.get(session_token=token)
        if session.expiry > timezone.now():
            is_valid = True
        else:
            is_valid = False
    except Session.DoesNotExist:
        is_valid = False
        return Response({'message': 'Session does not exist'}, status=status.HTTP_404_NOT_FOUND)
    

    if is_valid:
        return Response({'message': 'Token is valid'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)'''
