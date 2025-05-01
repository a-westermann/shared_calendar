from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('shared_calendar', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='appointment',
            name='recurrence_end_date',
        ),
    ] 