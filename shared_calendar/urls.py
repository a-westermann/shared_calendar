from django.urls import path
from .views import (
    CalendarView, create_appointment, get_appointments, update_appointment,
    delete_appointment, subscribe_to_notifications, unsubscribe_from_notifications,
    get_vapid_public_key
)

urlpatterns = [
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('calendar/api/appointments/create/', create_appointment, name='create_appointment'),
    path('calendar/api/appointments/get/', get_appointments, name='get_appointments'),
    path('calendar/api/appointments/<int:appointment_id>/update/', update_appointment, name='update_appointment'),
    path('calendar/api/appointments/<int:appointment_id>/delete/', delete_appointment, name='delete_appointment'),
    path('calendar/api/notifications/subscribe/', subscribe_to_notifications, name='subscribe_notifications'),
    path('calendar/api/notifications/unsubscribe/', unsubscribe_from_notifications, name='unsubscribe_notifications'),
    path('calendar/api/notifications/vapid-public-key/', get_vapid_public_key, name='vapid_public_key'),
] 