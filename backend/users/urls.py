from django.urls import path

from .views import *

urlpatterns = [
    path('login-api/', login_view, name='login_api'),
    path('logout-api/', logout_view, name='logout_api'),
]