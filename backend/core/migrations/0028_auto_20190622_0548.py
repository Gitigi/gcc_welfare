# Generated by Django 2.2.1 on 2019-06-22 05:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0027_auto_20190622_0542'),
    ]

    operations = [
        migrations.AlterField(
            model_name='library',
            name='file',
            field=models.FileField(upload_to=''),
        ),
    ]
