from django.urls import path
from .views import *

urlpatterns = [
    # Niche endpoints
    path('list-all/', list_niches, name='list_niches'),
    path('list-holder/', list_holder_niches, name='list_holder_niches'),
    path('create-new/', create_niche, name='create_niche'),
    path('delete/', delete_niches, name='delete_niches'),
    path('edit/', edit_niche, name='edit_niche'),
    
    # Deceased endpoints (follow audit pattern)
    path('deceased/list-all/', list_deceased, name='list_deceased'),
    path('deceased/create-new/', create_deceased, name='create_deceased'),
    path('deceased/edit/', edit_deceased, name='edit_deceased'),
    path('deceased/delete/', delete_deceased, name='delete_deceased'),
]