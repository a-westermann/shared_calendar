# Shared Calendar Django App

A Django app for managing shared calendars with user authentication.

## Project Rules

### Template Management
- Templates should NOT be created or modified in this repository
- All templates should be managed in the main Django project's templates directory
- The `.gitignore` file includes rules to prevent accidental template modifications
- If you need to modify templates, do so in the main project where this app is installed

## Installation

1. Install the package:
```bash
pip install shared-calendar
```

2. Add to your Django project's `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    ...
    'shared_calendar',
]
```

3. Add the following settings to your Django project's settings.py:
```python
# Custom user model
AUTH_USER_MODEL = 'shared_calendar.User'

# Authentication URLs
LOGIN_URL = '/calendar/login/'
LOGIN_REDIRECT_URL = '/calendar/'
LOGOUT_REDIRECT_URL = '/calendar/login/'
```

4. Include the app's URLs in your project's urls.py:
```python
from django.urls import path, include

urlpatterns = [
    ...
    path('calendar/', include('shared_calendar.urls')),
]
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

## Usage

1. Create a user through the Django shell:
```python
from shared_calendar.models import User
User.objects.create_user(
    username='your_username',
    first_name='Your Name',
    password='your_password',
    email='your@email.com'
)
```

2. Access the calendar at `/calendar/` in your browser.

## Features

- User authentication
- Calendar view with time slots
- Appointment creation and management
- User-specific appointments 