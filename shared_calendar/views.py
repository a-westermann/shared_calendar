from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.views import View
from django.utils.decorators import method_decorator
import json
from .models import Appointment
import logging

logger = logging.getLogger(__name__)

def check_session(view_func):
    def wrapper(request, *args, **kwargs):
        if 'user' not in request.session:
            return JsonResponse({
                'status': 'error',
                'message': 'Not logged in'
            }, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CalendarView(View):
    def get(self, request):
        if 'user' not in request.session:
            return redirect('/login/')  # Redirect to main site's login
        return render(request, 'shared_calendar/calendar.html', {
            'first_name': request.session.get('first_name', request.session['user'])
        })

@csrf_exempt
@require_POST
@check_session
def create_appointment(request):
    try:
        print("Session data:", request.session)
        print("Raw request body:", request.body)
        
        data = json.loads(request.body)
        print("Parsed data:", data)

        required_fields = ['title', 'date', 'start_time', 'end_time', 'can_watch_evee']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return JsonResponse({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=400)

        try:
            appointment = Appointment.objects.create(
                title=data['title'],
                date=data['date'],
                start_time=data['start_time'],
                end_time=data['end_time'],
                can_watch_evee=data['can_watch_evee'],
                user=request.session['user']
            )
            print("Appointment created successfully:", appointment.id)
        except Exception as e:
            print("Error creating appointment:", str(e))
            return JsonResponse({
                'status': 'error',
                'message': f'Error creating appointment: {str(e)}'
            }, status=400)
        
        return JsonResponse({
            'status': 'success',
            'id': appointment.id
        })
    except json.JSONDecodeError as e:
        print("JSON decode error:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        print("Unexpected error:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@require_GET
@check_session
def get_appointments(request):
    try:
        date = request.GET.get('date')
        if not date:
            return JsonResponse({
                'status': 'error',
                'message': 'Date parameter is required'
            }, status=400)

        appointments = Appointment.objects.filter(
            date=date,
            user=request.session['user']
        ).values(
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
