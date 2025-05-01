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
    ALLOWED_USERS = {'a.westermann.19', 'Ash'}

    def get(self, request):
        if 'user' not in request.session:
            return redirect('/')  # Redirect to main site's login
        
        username = json.loads(request.session['user'])['username']
        if username not in self.ALLOWED_USERS:
            return render(request, 'shared_calendar/access_denied.html', {
                'username': username
            })
            
        return render(request, 'shared_calendar/calendar.html', {
            'username': username
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
            username = json.loads(request.session['user'])['username']
            print(f"Creating appointment for user: {username}")
            print(f"Appointment data: {data}")
            
            # Check if there are any existing appointments that overlap
            existing_appointments = Appointment.objects.filter(
                date=data['date'],
                user=username
            ).exclude(
                end_time__lte=data['start_time']
            ).exclude(
                start_time__gte=data['end_time']
            )
            
            if existing_appointments.exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'An appointment already exists for this time slot'
                }, status=400)
            
            appointment = Appointment.objects.create(
                title=data['title'],
                date=data['date'],
                start_time=data['start_time'],
                end_time=data['end_time'],
                can_watch_evee=data['can_watch_evee'],
                user=username
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

        # Get appointments for both users
        appointments = Appointment.objects.filter(
            date=date,
            user__in=['a.westermann.19', 'Ash']
        ).values(
            'id', 'title', 'date', 'start_time', 'end_time', 'can_watch_evee', 'user'
        )
        
        return JsonResponse({
            'status': 'success',
            'appointments': list(appointments)
        })
    except Exception as e:
        print("Error in get_appointments view:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@csrf_exempt
@require_POST
@check_session
def update_appointment(request, appointment_id):
    try:
        data = json.loads(request.body)
        print("Update data:", data)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
            # Only allow updating if the current user owns the appointment
            if appointment.user != json.loads(request.session['user'])['username']:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Not authorized to update this appointment'
                }, status=403)

            appointment.title = data.get('title', appointment.title)
            appointment.date = data.get('date', appointment.date)
            appointment.start_time = data.get('start_time', appointment.start_time)
            appointment.end_time = data.get('end_time', appointment.end_time)
            appointment.can_watch_evee = data.get('can_watch_evee', appointment.can_watch_evee)
            appointment.save()

            return JsonResponse({
                'status': 'success',
                'id': appointment.id
            })
        except Appointment.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Appointment not found'
            }, status=404)
    except Exception as e:
        print("Error updating appointment:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@csrf_exempt
@require_POST
@check_session
def delete_appointment(request, appointment_id):
    try:
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            # Only allow deletion if the current user owns the appointment
            if appointment.user != json.loads(request.session['user'])['username']:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Not authorized to delete this appointment'
                }, status=403)

            appointment.delete()
            return JsonResponse({
                'status': 'success'
            })
        except Appointment.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Appointment not found'
            }, status=404)
    except Exception as e:
        print("Error deleting appointment:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
