# Generated by Django 2.2.1 on 2019-07-16 17:21

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0048_auto_20190716_1720'),
    ]

    operations = [
        migrations.AlterField(
            model_name='child',
            name='dob',
            field=models.DateField(blank=True, default=datetime.date.today),
        ),
        migrations.AlterField(
            model_name='payment',
            name='date_of_payment',
            field=models.DateField(blank=True, default=datetime.date.today),
        ),
    ]