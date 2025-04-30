from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .models import Appointment

def calendar(request):
    print("Calendar view called ")
    return render(request, 'shared_calendar/calendar.html')

@csrf_exempt
@require_POST
def create_appointment(request):
    try:
        # Print the raw request body for debugging
        print("Raw request body:", request.body)
        print("Request headers:", dict(request.headers))
        print("Request method:", request.method)
        
        # Try to parse the JSON data
        try:
            data = json.loads(request.body)
            print("Parsed data:", data)
        except json.JSONDecodeError as e:
            print("JSON decode error:", str(e))
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON data'
            }, status=400)

        # Validate required fields
        required_fields = ['title', 'date', 'start_time', 'end_time', 'can_watch_evee']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print("Missing fields:", missing_fields)
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
            print("Appointment created successfully:", appointment.id)
        except Exception as e:
            print("Error creating appointment in database:", str(e))
            return JsonResponse({
                'status': 'error',
                'message': f'Database error: {str(e)}'
            }, status=400)
        
        return JsonResponse({
            'status': 'success',
            'id': appointment.id
        })
    except Exception as e:
        print("Error in create_appointment view:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
