# Generated by Django 2.2.1 on 2019-06-28 05:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0037_auto_20190627_2101'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='member',
            name='children',
        ),
    ]
