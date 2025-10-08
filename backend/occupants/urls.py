from django.urls import path
from .views import *


urlpatterns = [
    path('list-all/', list_occupants, name='list_occupants'),
    path('create-new/', create_occupant, name='create_occupant'),
    path('edit/', edit_occupant, name='edit_occupant'),
    path('delete/', delete_occupant, name='delete_occupant'),
]