from django.db import models


class Person(models.Model):
    first_name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)  # In a real app, we'd use proper password hashing

    def __str__(self):
        return self.first_name


class Appointment(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    can_watch_evee = models.BooleanField(default=False)
    user = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='appointments')

    def __str__(self):
        return f"{self.title} on {self.date}"
