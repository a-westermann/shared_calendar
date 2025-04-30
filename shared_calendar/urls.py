from django.urls import path
from .views import CalendarView, create_appointment, get_appointments

urlpatterns = [
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('api/appointments/', create_appointment, name='create_appointment'),
    path('api/appointments/', get_appointments, name='get_appointments'),
] 