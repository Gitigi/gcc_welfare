# Generated by Django 2.2.1 on 2019-06-17 10:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_auto_20190615_1301'),
    ]

    operations = [
        migrations.AddField(
            model_name='banking',
            name='banked_by',
            field=models.CharField(default='john', max_length=30),
            preserve_default=False,
        ),
    ]
