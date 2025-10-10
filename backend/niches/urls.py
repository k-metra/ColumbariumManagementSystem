from django.urls import path

from .views import *

urlpatterns = [
    path('list-all/', list_niches, name='list_niches'),
    path('create-new/', create_niche, name='create_niche'),
    path('delete/', delete_niche, name='delete_niche'),
    path('edit/', edit_niche, name='edit_niche'),
]