from django.db import models


class Appointment(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    can_watch_evee = models.BooleanField(default=False)

    def __str__(self):
        return self.title
