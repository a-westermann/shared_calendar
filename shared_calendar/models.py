from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    class Meta:
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.first_name


class Appointment(models.Model):
    user = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    can_watch_evee = models.BooleanField(default=False)
    is_recurring = models.BooleanField(default=False)
    recurrence_days = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'shared_calendar_appointment'

    def __str__(self):
        return f"{self.title} on {self.date} from {self.start_time} to {self.end_time}"


class PushSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subscription_info = models.JSONField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Push subscription for {self.user.username}"
