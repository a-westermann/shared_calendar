# Shared Calendar App

A reusable Django app for a shared calendar.

## Project Rules

### Template Management
- Templates should NOT be created or modified in this repository
- All templates should be managed in the main Django project's templates directory
- The `.gitignore` file includes rules to prevent accidental template modifications
- If you need to modify templates, do so in the main project where this app is installed

## Installation

1. Install the package:
```bash
pip install django-shared-calendar
```

2. Add to your Django project's `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    ...
    'shared_calendar',
    ...
]
```

3. Include the app's URLs in your project's `urls.py`:
```python
urlpatterns = [
    ...
    path('calendar/', include('shared_calendar.urls')),
    ...
]
``` 