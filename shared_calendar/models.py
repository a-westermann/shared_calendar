from django.db import models
from django.contrib.auth.models import AbstractUser


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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')

    def __str__(self):
        return f"{self.title} on {self.date}"
