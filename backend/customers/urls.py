from django.urls import path
from .views import *

urlpatterns = [
    path("list-all/", customer_list, name="customer-list"),
    path("create-new/", create_customer, name="create-customer"),
    path("edit/", update_customer, name="update-customer"),
    path("delete/", delete_customers, name="delete-customers"),
    path("list-names/", customer_list_names, name="customer-list-names"), 
]