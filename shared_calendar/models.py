from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    class Meta:
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.first_name


class Appointment(models.Model):
    user = models.ForeignKey(AbstractUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    can_watch_evee = models.BooleanField(default=False)
    is_recurring = models.BooleanField(default=False)
    recurrence_days = models.JSONField(default=list)
    recurrence_end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} on {self.date} from {self.start_time} to {self.end_time}"
