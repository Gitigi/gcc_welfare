# Generated by Django 2.2.1 on 2019-06-28 13:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0039_member_dummy'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='member',
            name='spouse_first_name',
        ),
        migrations.RemoveField(
            model_name='member',
            name='spouse_id_no',
        ),
        migrations.RemoveField(
            model_name='member',
            name='spouse_last_name',
        ),
        migrations.RemoveField(
            model_name='member',
            name='spouse_middle_name',
        ),
        migrations.RemoveField(
            model_name='member',
            name='spouse_mobile_no',
        ),
    ]