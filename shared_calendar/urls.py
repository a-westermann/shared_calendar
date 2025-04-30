from django.urls import path
from . import views

urlpatterns = [
    path('', views.calendar, name='calendar'),
    path('api/appointments/', views.create_appointment, name='create_appointment'),
] 