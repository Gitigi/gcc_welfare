# Generated by Django 2.2.1 on 2019-06-15 11:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_banking'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='salutation',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
    ]
