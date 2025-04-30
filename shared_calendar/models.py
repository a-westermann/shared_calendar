from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    class Meta:
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.first_name


class Appointment(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    can_watch_evee = models.BooleanField(default=False)
    user = models.CharField(max_length=100)  # Store the username from session

    def __str__(self):
        return f"{self.title} on {self.date}"
