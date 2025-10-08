from django.urls import path
from .views import *

urlpatterns = [
    path('list-all/', list_contacts, name='list_contacts'),
    path('create-new/', create_contact, name='create_contact'),
    path('delete/', delete_contact, name='delete_contact'),
    path('edit/', edit_contact, name='edit_contact'),
]