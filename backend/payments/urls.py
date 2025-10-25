from django.urls import path
from .views import *

urlpatterns = [
    path('list-all/', list_payments, name='list_payments'),
    path('create-new/', create_payment, name='create_payment'),
    path('delete/', delete_payment, name='delete_payment'),
    path('edit/', edit_payment, name='edit_payment'),
    path('<int:payment_id>/details/', get_payment_details, name='get_payment_details'),
    path('<int:payment_id>/add-payment/', add_payment_detail, name='add_payment_detail'),
]