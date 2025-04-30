from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from .models import Appointment
import logging

logger = logging.getLogger(__name__)

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('calendar')
        else:
            return render(request, 'shared_calendar/login.html', {
                'error': 'Invalid credentials'
            })
    return render(request, 'shared_calendar/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

class CalendarView(LoginRequiredMixin, View):
    def get(self, request):
        return render(request, 'shared_calendar/calendar.html', {
            'first_name': request.user.first_name
        })

@csrf_exempt
@require_POST
@login_required
def create_appointment(request):
    try:
        data = json.loads(request.body)
        logger.debug("Parsed data:", data)

        required_fields = ['title', 'date', 'start_time', 'end_time', 'can_watch_evee']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return JsonResponse({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=400)

        appointment = Appointment.objects.create(
            title=data['title'],
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            can_watch_evee=data['can_watch_evee'],
            user=request.user
        )
        
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
@login_required
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
            user=request.user
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
