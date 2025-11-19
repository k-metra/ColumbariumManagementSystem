from django.urls import path
from .views import *

urlpatterns = [
    path("list-all/", customer_list, name="customer-list"),
    path("create-new/", create_customer, name="create-customer"),
    path("edit/", update_customer, name="update-customer"),
    path("delete/", delete_customers, name="delete-customers"),
    path("list-names/", customer_list_names, name="customer-list-names"),
    path("search-by-deceased/", search_by_deceased, name="search-by-deceased"),
    path("search-by-refno/", search_by_reference_number, name="search-by-reference-number"),
    path("expiring-soon/", get_expiring_soon_niches, name="expiring-soon-niches"),
    path("recently-availed/", get_recently_availed_niches, name="recently-availed-niches"),
    path("expired-niches/", get_expired_niches, name="expired-niches"),
    path("expired-count/", get_expired_niches_count, name="expired-count"),
]