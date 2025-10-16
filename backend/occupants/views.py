from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie
from django.utils import timezone

from user_sessions.models import Session
from users.models import User
from niches.models import Niche

# Create your views here.
@api_view(['GET'])
@ensure_csrf_cookie
def list_occupants(request):
    if request.method == 'GET':
        session_token = request.headers.get("Session-Token")
        
        if not session_token:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            session = Session.objects.get(session_token=session_token)

            user = session.user

            if user.has_permission("view_records") and user.has_permission("view_dashboard"):
                occupants = Occupant.objects.all().order_by('-interment_date')
                serializer = OccupantSerializer(occupants, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
@requires_csrf_token
def create_occupant(request):
    if request.method == 'POST':
        session_token = request.headers.get("Session-Token")
        if not session_token:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            session = Session.objects.get(session_token=session_token)
            niche = Niche.objects.get(id=request.data.get("niche_id"))


            user = session.user

            if user.has_permission("add_record"):
                new_data = request.data.copy()
                new_data.pop("niche_id", None)
                serializer = OccupantSerializer(data=new_data, context={'niche': niche})
                if serializer.is_valid():
                    serializer.save()
                    niche.status = "Occupied"
                    niche.save()
                    return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "You do not have permission to add records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:    
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
        except Niche.DoesNotExist:
            print("niche does not exist.")
            return Response({"error": "Niche with the provided ID does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['PUT'])
@requires_csrf_token
def edit_occupant(request):
    if request.method == "PUT":
        session_token = request.headers.get("Session-Token")
        if not session_token:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        element_id = request.data.get("element_id")
        if not element_id:
            return Response({"error": "Element ID is missing."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = Session.objects.get(session_token=session_token)

            user = session.user

            if user.has_permission("edit_record") and user.has_permission("view_dashboard"):
                try:
                    occupant = Occupant.objects.get(id=element_id)
                except Occupant.DoesNotExist:
                    return Response({"error": "Occupant with the provided ID does not exist."}, status=status.HTTP_404_NOT_FOUND)
                
                serializer = OccupantSerializer(occupant, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "You do not have permission to edit records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
def delete_occupant(request):
    if request.method == 'DELETE':
        element_ids = request.data.get("element_ids")
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

                for id in element_ids:
                    print("Deleting id:", id)
                    try:
                        occupant = Occupant.objects.get(id=id)
                        niche = occupant.niche
                        niche.status = "Available"
                        niche.save()
                        occupant.delete()
                    except Occupant.DoesNotExist:
                        return Response({"error": f"Occupant record with id {id} not found."}, status=status.HTTP_404_NOT_FOUND)

                return Response({"ids": element_ids}, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to delete records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)