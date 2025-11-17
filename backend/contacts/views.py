from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie

# Create your views here.
from .models import Contact
from users.models import User
from user_sessions.models import Session
from .serializers import ContactSerializer
from django.utils import timezone

@api_view(['GET'])
def list_contacts(request):
    if request.method == 'GET':
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

            #session_expiry = user_session.expiry

            #if timezone.now() > session_expiry:
                #return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("view_records") and user.has_permission("view_dashboard"):
                contacts = Contact.objects.all().order_by('-deceased_date')

                serializer = ContactSerializer(contacts, many=True)
                
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to view these records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@csrf_exempt
def create_contact(request):
    if request.method == 'POST':
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

  #          session_expiry = user_session.expiry

#            if timezone.now() > session_expiry:
 #               return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("add_record") and user.has_permission("view_dashboard"):
                serializer = ContactSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"error": "You do not have permission to add records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
@csrf_exempt
def edit_contact(request):
    if request.method == 'PUT':
        SESSION_TOKEN = request.headers.get("Session-Token")
        contact_id = request.GET.get("contact_id")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

  #          session_expiry = user_session.expiry

 #           if timezone.now() > session_expiry:
#                return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("edit_record") and user.has_permission("view_dashboard"):
                try:
                    contact = Contact.objects.get(id=contact_id)
                except Contact.DoesNotExist:
                    return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)

                serializer = ContactSerializer(contact, data=request.data, partial=True)
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
@csrf_exempt
def delete_contact(request):
    if request.method == 'DELETE':
        contacts = request.data.get("element_ids")
        SESSION_TOKEN = request.headers.get("Session-Token")

        if not SESSION_TOKEN:
            return Response({"error": "Session token is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_session = Session.objects.get(session_token=SESSION_TOKEN)

     #       session_expiry = user_session.expiry

    #        if timezone.now() > session_expiry:
   #             return Response({"error": "Session has expired. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
            
            # If session is valid, check user for permissions
            user = user_session.user
            if user.has_permission("delete_record") and user.has_permission("view_dashboard"):

                for id in contacts:
                    try:
                        contact = Contact.objects.get(id=id)
                        contact.delete()
                    except Contact.DoesNotExist:
                        return Response({"error": f"Contact record with id {id} not found."}, status=status.HTTP_404_NOT_FOUND)

                return Response({"ids": contacts}, status=status.HTTP_200_OK)

            return Response({"error": "You do not have permission to delete records."}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({"error": "Invalid session token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User associated with this session does not exist."}, status=status.HTTP_401_UNAUTHORIZED)
