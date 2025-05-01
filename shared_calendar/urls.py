from django.urls import path
from .views import CalendarView, create_appointment, get_appointments, update_appointment, delete_appointment

urlpatterns = [
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('calendar/api/appointments/create/', create_appointment, name='create_appointment'),
    path('calendar/api/appointments/get/', get_appointments, name='get_appointments'),
    path('calendar/api/appointments/<int:appointment_id>/update/', update_appointment, name='update_appointment'),
    path('calendar/api/appointments/<int:appointment_id>/delete/', delete_appointment, name='delete_appointment'),
] 