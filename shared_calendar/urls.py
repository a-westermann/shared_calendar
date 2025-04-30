from django.urls import path
from .views import CalendarView, create_appointment, get_appointments

urlpatterns = [
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('calendar/api/appointments/create/', create_appointment, name='create_appointment'),
    path('calendar/api/appointments/get/', get_appointments, name='get_appointments'),
] 