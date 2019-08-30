from django.db import models
from django.utils import timezone
from django.db.models.signals import post_delete
from django.dispatch import receiver
import datetime

class Member(models.Model):
    first_name = models.CharField(max_length=30,blank=False,null=False,default='',db_index=True)
    middle_name = models.CharField(max_length=30,blank=False,null=False,default='')
    last_name = models.CharField(max_length=30,blank=False,null=False,default='')
    address = models.CharField(max_length=15,blank=True, default='')
    code = models.CharField(max_length=10,blank=True, default='')
    city = models.CharField(max_length=15,blank=True, default='')
    id_no = models.IntegerField(null=False, unique=True)
    mobile_no = models.CharField(max_length=15,blank=False,null=False)
    email = models.CharField(max_length=30,blank=True,default='')
    nhif_no = models.CharField(max_length=30,blank=True, default='')
    spouse = models.ForeignKey("self", on_delete=models.SET_NULL,blank=True,null=True)
    father_first_name=models.CharField(max_length=40,blank=True, default='')
    father_middle_name=models.CharField(max_length=40,blank=True, default='')
    father_last_name=models.CharField(max_length=40,blank=True, default='')
    mother_first_name=models.CharField(max_length=40, blank=True, default='')
    mother_middle_name=models.CharField(max_length=40, blank=True, default='')
    mother_last_name=models.CharField(max_length=40, blank=True, default='')
    suspended = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    suspended = models.BooleanField(default=False)
    salutation = models.CharField(max_length=10,default='',blank=True)
    gender = models.CharField(max_length=1,choices=[('M','male'),('F','female')],default='M',blank=False,null=False)
    dob = models.DateField(null=False,blank=True,default=timezone.now)
    dummy = models.BooleanField(default=False)

    @property
    def reg(self):
        return "Gcc/w/%04d" % (self.id,)
    

    def __str__(self):
        return self.first_name + ' ' + self.middle_name + ' ' + self.last_name + ';' + str(self.id)

class Child(models.Model):
    first_name = models.CharField(max_length=30,blank=False,null=False,default='')
    middle_name = models.CharField(max_length=30,blank=False,null=False,default='')
    dob = models.DateField(null=False,blank=True,default=datetime.date.today)
    father = models.ForeignKey(Member, on_delete=models.SET_NULL,null=True,related_name='fathered')
    mother = models.ForeignKey(Member, on_delete=models.SET_NULL,null=True,related_name='mothered')

class Payment(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    amount = models.IntegerField(null=False)
    method = models.CharField(max_length=2,choices=[
        ('CA','cash'),('BK','bank'),('MP','mpesa')],default='CA')
    ref_no = models.CharField(max_length=15,null=False,blank=True,default='')
    mobile_no = models.CharField(max_length=15,null=False,blank=True,default='')
    bank_name = models.CharField(max_length=15,null=False,blank=True,default='')
    date_of_payment = models.DateField(null=True,blank=True,default=datetime.date.today)
    date = models.DateTimeField(auto_now_add=True)
    start_period = models.DateField(null=True,blank=True)


class Period(models.Model):
    payment = models.ForeignKey(Payment,on_delete=models.CASCADE)
    period = models.DateField(null=False,blank=False)
    amount = models.IntegerField(null=False)


class Banking(models.Model):
    bank_name = models.CharField(max_length=30,null=False,blank=False)
    account = models.CharField(max_length=20,null=False,blank=False)
    amount = models.IntegerField(null=False)
    date = models.DateField(null=False)
    banked_by = models.CharField(max_length=30,null=False,blank=False)

class Note(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    note = models.TextField(null=False,blank=False);
    date = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    heading = models.CharField(max_length=30,null=False,blank=False)
    body = models.TextField(null=False,blank=False);
    target = models.CharField(max_length=10,null=False,blank=False)
    status = models.CharField(max_length=10,blank=True,default='')
    contribution = models.CharField(max_length=10,blank=True,default='')
    contacts = models.TextField(blank=True,default='')
    date = models.DateTimeField(auto_now_add=True)

class Claim(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    bank_name = models.CharField(max_length=30,null=False,blank=False)
    account = models.CharField(max_length=20,null=False,blank=False)
    amount = models.IntegerField(null=False)
    date = models.DateField(null=False)
    reason = models.TextField(blank=True,default='')
    disbursement = models.CharField(max_length=2,null=False,blank=False,choices=[
        ('CA','Cash'),('CQ','Cheque')],default='CA')

class Expenditure(models.Model):
    name = models.CharField(max_length=100,null=False,blank=False)
    amount = models.IntegerField(null=False)
    date = models.DateField(null=False)
    reason = models.TextField(blank=True,default='')


class Library(models.Model):
    file = models.FileField(blank=False)
    date = models.DateField(auto_now_add=True)

@receiver(post_delete, sender=Library)
def submission_delete(sender, instance, **kwargs):
    instance.file.delete(False) 