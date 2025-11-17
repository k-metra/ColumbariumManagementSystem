from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Niche, Deceased
from django.views.decorators.csrf import csrf_exempt
from .serializers import NicheSerializer, NicheListSerializer, DeceasedSerializer
from customers.models import Customer

from user_sessions.utils import verify_session, get_user_from_session   

# Niche Views
@api_view(['GET'])
@csrf_exempt
def list_niches(request):
    """List all niches"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("view_records") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to view niches.'}, status=status.HTTP_403_FORBIDDEN)

    niches = Niche.objects.select_related('holder').prefetch_related('deceased_records').all()
    serializer = NicheListSerializer(niches, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@csrf_exempt  
def list_holder_niches(request):
    """List niches for a specific holder"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("view_records") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to view niches.'}, status=status.HTTP_403_FORBIDDEN)

    holder_id = request.GET.get('holder_id')
    if not holder_id:
        return Response({'error': 'Holder ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        holder = Customer.objects.get(id=holder_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Holder not found'}, status=status.HTTP_404_NOT_FOUND)

    niches = Niche.objects.filter(holder=holder).prefetch_related('deceased_records')
    serializer = NicheSerializer(niches, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@csrf_exempt
def create_niche(request):
    """Create a new niche for a holder"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("add_record") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to create niches.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = NicheSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@csrf_exempt
def edit_niche(request):
    """Edit an existing niche"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("edit_record") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to edit niches.'}, status=status.HTTP_403_FORBIDDEN)

    niche_id = request.GET.get('niche_id')
    if not niche_id:
        return Response({'error': 'Niche ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        niche = Niche.objects.get(id=niche_id)
    except Niche.DoesNotExist:
        return Response({'error': 'Niche not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = NicheSerializer(niche, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@csrf_exempt
def delete_niches(request):
    """Delete niches"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("delete_record") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to delete niches.'}, status=status.HTTP_403_FORBIDDEN)

    niche_ids = request.data.get('element_ids', [])
    if not niche_ids:
        return Response({'error': 'No niche IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

    deleted_ids = []
    for niche_id in niche_ids:
        try:
            niche = Niche.objects.get(id=niche_id)
            niche.delete()
            deleted_ids.append(niche_id)
        except Niche.DoesNotExist:
            continue  # Skip non-existent niches

    return Response({'ids': deleted_ids}, status=status.HTTP_200_OK)

# Deceased Views
@api_view(['GET'])
@csrf_exempt
def list_deceased(request):
    """List deceased for a specific niche"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("view_records") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to view deceased records.'}, status=status.HTTP_403_FORBIDDEN)

    niche_id = request.GET.get('niche_id')
    if not niche_id:
        return Response({'error': 'Niche ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        niche = Niche.objects.get(id=niche_id)
    except Niche.DoesNotExist:
        return Response({'error': 'Niche not found'}, status=status.HTTP_404_NOT_FOUND)

    deceased = Deceased.objects.filter(niche=niche)
    serializer = DeceasedSerializer(deceased, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@csrf_exempt
def create_deceased(request):
    """Add a deceased record to a niche"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("add_record") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to create deceased records.'}, status=status.HTTP_403_FORBIDDEN)

    # Check niche capacity before creating
    niche_id = request.data.get('niche')
    if niche_id:
        try:
            niche = Niche.objects.get(id=niche_id)
            if niche.is_full():
                return Response({'error': f'This niche has reached its maximum capacity of {niche.max_deceased} deceased records.'}, status=status.HTTP_400_BAD_REQUEST)
        except Niche.DoesNotExist:
            return Response({'error': 'Niche not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DeceasedSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@csrf_exempt
def edit_deceased(request):
    """Edit a deceased record"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("edit_record") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to edit deceased records.'}, status=status.HTTP_403_FORBIDDEN)

    deceased_id = request.GET.get('deceased_id')
    if not deceased_id:
        return Response({'error': 'Deceased ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        deceased = Deceased.objects.get(id=deceased_id)
    except Deceased.DoesNotExist:
        return Response({'error': 'Deceased record not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DeceasedSerializer(deceased, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"ids": [serializer.data["id"]]}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@csrf_exempt
def delete_deceased(request):
    """Delete deceased records"""
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
    
    is_session_valid = verify_session(authorization_header)
    if not is_session_valid:
        return Response({'error': 'Invalid or expired session'}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_from_session(authorization_header)
    if not user:
        return Response({'error': 'Invalid or expired session: User not found'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.has_permission("delete_record") and user.has_permission("view_dashboard")):
        return Response({'error': 'You do not have permission to delete deceased records.'}, status=status.HTTP_403_FORBIDDEN)

    deceased_ids = request.data.get('element_ids', [])
    if not deceased_ids:
        return Response({'error': 'No deceased IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

    deleted_ids = []
    for deceased_id in deceased_ids:
        try:
            deceased = Deceased.objects.get(id=deceased_id)
            deceased.delete()
            deleted_ids.append(deceased_id)
        except Deceased.DoesNotExist:
            continue  # Skip non-existent records

    return Response({'ids': deleted_ids}, status=status.HTTP_200_OK)