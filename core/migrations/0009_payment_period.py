# Generated by Django 2.2.1 on 2019-06-06 05:26

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_payment_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='period',
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
