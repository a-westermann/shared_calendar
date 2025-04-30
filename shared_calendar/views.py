from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .models import Appointment

def calendar(request):
    return render(request, 'shared_calendar/calendar.html')

@csrf_exempt
@require_POST
def create_appointment(request):
    try:
        data = json.loads(request.body)
        appointment = Appointment.objects.create(
            title=data['title'],
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            can_watch_evee=data['can_watch_evee']
        )
        return JsonResponse({
            'status': 'success',
            'id': appointment.id
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
