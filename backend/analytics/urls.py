from django.urls import path
from .views import *

urlpatterns = [
    path('data/', get_analytics_data, name='get_analytics_data'),
]