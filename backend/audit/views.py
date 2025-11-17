from django.shortcuts import render
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token

from .models import AuditLog
from .serializers import AuditLogSerializer

# Create your views here.
@api_view(['GET'])
@csrf_exempt
def list_audit_logs(request: Request) -> Response:
    # Your logic to list audit logs
    if request.method == 'GET':

        logs = AuditLog.objects.all().order_by('-timestamp')
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
