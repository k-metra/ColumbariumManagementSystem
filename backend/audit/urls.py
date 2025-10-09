from django.urls import path

from .views import *

urlpatterns = [
    path("list-all/", list_audit_logs, name="list_audit_logs"),
]