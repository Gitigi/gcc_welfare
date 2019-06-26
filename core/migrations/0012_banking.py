# Generated by Django 2.2.1 on 2019-06-13 08:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_auto_20190606_0815'),
    ]

    operations = [
        migrations.CreateModel(
            name='Banking',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bank_name', models.CharField(max_length=30)),
                ('account', models.CharField(max_length=20)),
                ('amount', models.IntegerField()),
                ('date', models.DateTimeField()),
            ],
        ),
    ]
