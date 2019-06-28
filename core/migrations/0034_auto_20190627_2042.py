# Generated by Django 2.2.1 on 2019-06-27 20:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0033_member_spouse'),
    ]

    operations = [
        migrations.AlterField(
            model_name='child',
            name='father',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='fathered', to='core.Member'),
        ),
        migrations.AlterField(
            model_name='child',
            name='mother',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='mothered', to='core.Member'),
        ),
    ]