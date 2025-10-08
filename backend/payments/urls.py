from django.urls import path
from .views import *

urlpatterns = [
    path('list-all/', list_payments, name='list_payments'),
    path('create-new/', create_payment, name='create_payment'),
    path('delete/', delete_payment, name='delete_payment'),
]