from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.views import View
from django.utils.decorators import method_decorator
import json
from .models import Appointment
import logging
logger = logging.getLogger(__name__)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CalendarView(View):
    def get(self, request):
        logger.debug("Calendar view called ")
        return render(request, 'shared_calendar/calendar.html')

@csrf_exempt
@require_POST
def create_appointment(request):
    try:
        # logger.debug the raw request body for debugging
        logger.debug("Raw request body:", request.body)
        logger.debug("Request headers:", dict(request.headers))
        logger.debug("Request method:", request.method)
        
        # Try to parse the JSON data
        try:
            data = json.loads(request.body)
            logger.debug("Parsed data:", data)
        except json.JSONDecodeError as e:
            logger.debug("JSON decode error:", str(e))
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON data'
            }, status=400)

        # Validate required fields
        required_fields = ['title', 'date', 'start_time', 'end_time', 'can_watch_evee']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.debug("Missing fields:", missing_fields)
            return JsonResponse({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=400)

        # Create the appointment
        try:
            appointment = Appointment.objects.create(
                title=data['title'],
                date=data['date'],
                start_time=data['start_time'],
                end_time=data['end_time'],
                can_watch_evee=data['can_watch_evee']
            )
            logger.debug("Appointment created successfully:", appointment.id)
        except Exception as e:
            logger.debug("Error creating appointment in database:", str(e))
            return JsonResponse({
                'status': 'error',
                'message': f'Database error: {str(e)}'
            }, status=400)
        
        return JsonResponse({
            'status': 'success',
            'id': appointment.id
        })
    except Exception as e:
        logger.debug("Error in create_appointment view:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@require_GET
def get_appointments(request):
    try:
        date = request.GET.get('date')
        if not date:
            return JsonResponse({
                'status': 'error',
                'message': 'Date parameter is required'
            }, status=400)

        appointments = Appointment.objects.filter(date=date).values(
            'id', 'title', 'date', 'start_time', 'end_time', 'can_watch_evee'
        )
        
        return JsonResponse({
            'status': 'success',
            'appointments': list(appointments)
        })
    except Exception as e:
        logger.debug("Error in get_appointments view:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
