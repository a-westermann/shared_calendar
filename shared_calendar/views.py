from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.views import View
from django.utils.decorators import method_decorator
import json
from .models import Appointment
import logging
from datetime import datetime, timedelta
from dateutil import parser
from django.contrib.auth.decorators import login_required

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

@require_POST
@login_required
def create_appointment(request):
    try:
        print("\n=== Creating Appointment ===")
        print("Raw request body:", request.body)
        data = json.loads(request.body)
        print("Parsed data:", data)
        
        # Validate required fields
        required_fields = ['title', 'date', 'start_time', 'end_time']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print(f"Missing required fields: {missing_fields}")
            return JsonResponse({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=400)
        
        # Validate date format
        print(f"Validating date: {data['date']}")
        try:
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            print(f"Successfully parsed date: {date}")
        except ValueError as e:
            print(f"Date parsing error: {str(e)}")
            return JsonResponse({
                'error': f'Invalid date format: {data["date"]}. Must be in YYYY-MM-DD format.'
            }, status=400)
        
        # Extract recurrence data
        is_recurring = data.get('is_recurring', False)
        recurrence_days = data.get('recurrence_days', [])
        
        print("\nRecurrence details:")
        print(f"is_recurring: {is_recurring}")
        print(f"recurrence_days: {recurrence_days}")
        
        # Create the initial appointment
        appointment = Appointment.objects.create(
            user=request.user,
            title=data['title'],
            date=date,
            start_time=data['start_time'],
            end_time=data['end_time'],
            can_watch_evee=data.get('can_watch_evee', False),
            is_recurring=is_recurring,
            recurrence_days=recurrence_days,
            recurrence_end_date=None
        )
        
        print("\nCreated initial appointment:")
        print(f"ID: {appointment.id}")
        print(f"Title: {appointment.title}")
        print(f"Date: {appointment.date}")
        print(f"Recurring: {appointment.is_recurring}")
        print(f"Recurrence days: {appointment.recurrence_days}")
        
        # If recurring, create additional instances for the next 6 months
        if is_recurring and recurrence_days:
            print("\nCreating recurring instances...")
            end_date = date + timedelta(days=180)  # Create instances for 6 months
            
            current_date = date
            while current_date <= end_date:
                if current_date.weekday() in recurrence_days and current_date != date:
                    Appointment.objects.create(
                        user=request.user,
                        title=data['title'],
                        date=current_date,
                        start_time=data['start_time'],
                        end_time=data['end_time'],
                        can_watch_evee=data.get('can_watch_evee', False),
                        is_recurring=True,
                        recurrence_days=recurrence_days,
                        recurrence_end_date=None
                    )
                    print(f"Created recurring instance for {current_date}")
                current_date += timedelta(days=1)
        
        return JsonResponse({
            'id': appointment.id,
            'title': appointment.title,
            'date': appointment.date,
            'start_time': appointment.start_time,
            'end_time': appointment.end_time,
            'can_watch_evee': appointment.can_watch_evee,
            'is_recurring': appointment.is_recurring,
            'recurrence_days': appointment.recurrence_days
        })
    except Exception as e:
        print(f"\nError creating appointment: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

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

            # Update the appointment
            appointment.title = data.get('title', appointment.title)
            appointment.date = data.get('date', appointment.date)
            appointment.start_time = data.get('start_time', appointment.start_time)
            appointment.end_time = data.get('end_time', appointment.end_time)
            appointment.can_watch_evee = data.get('can_watch_evee', appointment.can_watch_evee)
            appointment.is_recurring = data.get('is_recurring', appointment.is_recurring)
            appointment.recurrence_days = data.get('recurrence_days', appointment.recurrence_days)
            appointment.save()

            # If this is a recurring appointment, update all instances
            if appointment.is_recurring and appointment.recurrence_days:
                # Update all instances of this recurring appointment
                recurring_appointments = Appointment.objects.filter(
                    title=appointment.title,
                    start_time=appointment.start_time,
                    end_time=appointment.end_time,
                    user=appointment.user,
                    is_recurring=True
                ).exclude(id=appointment.id)
                
                for recurring in recurring_appointments:
                    recurring.title = appointment.title
                    recurring.start_time = appointment.start_time
                    recurring.end_time = appointment.end_time
                    recurring.can_watch_evee = appointment.can_watch_evee
                    recurring.recurrence_days = appointment.recurrence_days
                    recurring.save()

            return JsonResponse({
                'status': 'success',
                'id': appointment.id,
                'title': appointment.title,
                'date': appointment.date,
                'start_time': appointment.start_time,
                'end_time': appointment.end_time,
                'can_watch_evee': appointment.can_watch_evee,
                'is_recurring': appointment.is_recurring,
                'recurrence_days': appointment.recurrence_days
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
