# Generated by Django 2.2.1 on 2019-06-17 21:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_banking_banked_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='gender',
            field=models.CharField(choices=[('M', 'male'), ('F', 'female')], default='M', max_length=1),
        ),
    ]