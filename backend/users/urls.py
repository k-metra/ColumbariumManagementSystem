from django.urls import path

from .views import *

urlpatterns = [
    path('login-api/', login_view, name='login_api'),
    path('logout-api/', logout_view, name='logout_api'),
    path('create-new/', create_user, name='create_user'),
    path('list-all/', list_users, name='list_users'),
    path('edit/', edit_user, name='edit_user'),
    path('delete/', delete_user, name='delete_user'),
    path('csrf-token/', get_csrf_token, name='get_csrf_token'),
]