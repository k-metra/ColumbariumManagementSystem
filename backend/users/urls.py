from django.urls import path

from .views import *

urlpatterns = [
    path('login-api/', login_view, name='login_api'),
]