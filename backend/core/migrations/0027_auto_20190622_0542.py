# Generated by Django 2.2.1 on 2019-06-22 05:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_library'),
    ]

    operations = [
        migrations.AlterField(
            model_name='library',
            name='file',
            field=models.ImageField(upload_to=''),
        ),
    ]
