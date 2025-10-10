from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Niche
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from .serializers import NicheSerializer

from user_sessions.models import Session
from user_sessions.utils import verify_session, get_user_from_session   

# Create your views here.
@api_view(['GET'])
@csrf_exempt
def list_niches(request):
    if request.method == 'GET':

        authorization_header = request.headers.get('Authorization')

        if not authorization_header:
            return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
        
        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_user_from_session(authorization_header)

        if not user:
            return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        # If we reach this point, the user is authenticated

        if user.has_permission("view_records") and user.has_permission("view_dashboard"):
            niches = Niche.objects.all()
            serializer = NicheSerializer(niches, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'You do not have permission to view niches.'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@requires_csrf_token
def create_niche(request):
    if request.method == 'POST':

        authorization_header = request.headers.get('Authorization')

        if not authorization_header:
            return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
        
        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_user_from_session(authorization_header)

        if not user:
            return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        # If we reach this point, the user is authenticated

        if user.has_permission("add_record") and user.has_permission("view_dashboard"):
            serializer = NicheSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'You do not have permission to create niches.'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@requires_csrf_token
def edit_niche(request):
    if request.method == 'PUT':

        authorization_header = request.headers.get('Authorization')

        if not authorization_header:
            return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
        
        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_user_from_session(authorization_header)

        if not user:
            return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        # If we reach this point, the user is authenticated

        if user.has_permission("edit_record") and user.has_permission("view_dashboard"):
            try:
                niche_id = request.GET.get('niche_id')
                niche = Niche.objects.get(id=niche_id)
            except Niche.DoesNotExist:
                return Response({'error': 'Niche not found'}, status=status.HTTP_404_NOT_FOUND)

            serializer = NicheSerializer(niche, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'You do not have permission to edit niches.'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@requires_csrf_token
def delete_niche(request):
    if request.method == 'DELETE':
        authorization_header = request.headers.get('Authorization')

        if not authorization_header:
            return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
        
        is_session_valid = verify_session(authorization_header)

        if not is_session_valid:
            return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_user_from_session(authorization_header)

        if not user:
            return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        # If we reach this point, the user is authenticated

        if user.has_permission("delete_record") and user.has_permission("view_dashboard"):
            try:
                niche_ids = request.data.get('element_ids')
                
                for id in niche_ids:
                    niche = Niche.objects.get(id=id)
                    niche.delete()
            except Niche.DoesNotExist:
                return Response({'error': 'Niche not found'}, status=status.HTTP_404_NOT_FOUND)

            return Response({'ids': niche_ids}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'You do not have permission to delete niches.'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)