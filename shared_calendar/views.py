from django.shortcuts import render


def calendar(request):
    return render(request, 'shared_calendar/calendar.html')
