# Generated by Django 2.2.1 on 2019-06-15 11:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_member_salutation'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='gender',
            field=models.CharField(blank=True, choices=[('M', 'male'), ('F', 'female')], default='', max_length=1),
        ),
    ]
