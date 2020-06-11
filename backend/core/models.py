from django.db import models
from django.utils import timezone
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
import datetime, threading, re
from dateutil.relativedelta import relativedelta

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

class BankingNotification(models.Model):
    name = models.CharField(max_length=50,null=False,blank=False)
    mobile_no = models.CharField(max_length=15,null=False,blank=False)

    def __str__(self):
        return self.name + ' ' + self.mobile_no



#Either set notification and member or
#actual msg and number
class SmsMessage(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, null=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, null=True)
    msg = models.TextField(blank=True,default='')
    mobile_no = models.CharField(max_length=30, blank=True, default='')
    status_code = models.CharField(max_length=30, blank=True, default='')
    status_desc = models.CharField(max_length=255, blank=True, default='')

    def get_message(self):
        if self.notification:
            number = self.member.mobile_no
            msg = self.notification.heading + '\n' + self.notification.body
            if re.search(r'#(NAME|LAST_PAYED_PERIOD|NUMBER_OF_UNPAYED_PERIOD|CURRENT_PERIOD|UNPAYED_PERIOD)', msg):
                name = self.member.first_name.upper() + ' ' + self.member.middle_name.upper() + ' ' + self.member.last_name.upper()
                current_period = datetime.date.today().replace(day=1).strftime('%d/%m/%Y')
                unpayed_period = self.member.date_joined if self.member.date_joined.year > 2016 else datetime.date(2017,1,1)
                unpayed_period += relativedelta(day=1)
                last_payed_period = Period.objects.filter(period__year__gt=2016,payment__member=self.member).order_by('-period').first()
                if last_payed_period:
                    unpayed_period = last_payed_period.period + relativedelta(months=+1,day=1)
                    last_payed_period = last_payed_period.period.strftime('%d/%m/%Y')
                else:
                    last_payed_period = 'No record of payment'
                
                time_diff = relativedelta(datetime.date.today(),unpayed_period)
                number_of_unpayed_period = (time_diff.years * 12) + time_diff.months
                number_of_unpayed_period += 1 if datetime.date.today().month >= unpayed_period.month else 0
                unpayed_period = unpayed_period.strftime('%d/%m/%Y')
                if number_of_unpayed_period > 1:
                    unpayed_period = unpayed_period + ' - ' + current_period

                msg = re.sub('#NAME',name,msg)
                msg = re.sub('#CURRENT_PERIOD',current_period,msg)
                msg = re.sub('#LAST_PAYED_PERIOD',last_payed_period,msg)
                msg = re.sub('#UNPAYED_PERIOD',unpayed_period,msg)
                msg = re.sub('#NUMBER_OF_UNPAYED_PERIOD',str(number_of_unpayed_period),msg)
        else:
            msg = self.msg
            number = self.mobile_no

        return {'msg': msg, 'mobile_no': self.member.mobile_no}

    def send_message(self):
        from .utility import send_message as send_message_utility
        threading.Thread(target=send_message_utility,args=([self.get_message()],)).start()



@receiver(post_delete, sender=Library)
def submission_delete(sender, instance, **kwargs):
    instance.file.delete(False) 


@receiver(post_save, sender=Notification)
def send_messages_on_save(sender, instance, created, *args, **kwargs):
    if not created:
        return;
    if instance.target == 'individual':
        members = Member.objects.filter(id__in=instance.contacts.split(';'))
    else:
        today = datetime.datetime.today()
        members = Member.objects.filter(dummy=False)
        #get list of member who have contributed for current period
        p = Payment.objects.filter(period__period__year=today.year,period__period__month=today.month).values_list('member')
        if instance.status == 'active':
            members = members.filter(suspended=False)
        elif instance.status == 'suspended':
            members = members.filter(suspended=True)
        if instance.contribution == 'up-to-date':
            members = members.filter(id__in=p)
        elif instance.contribution == 'lagging':
            members = members.annotate(payment_count=Count('payment')).filter(payment_count__gt = 0).exclude(id__in=p)
        elif instance.contribution == 'dormant':
            members = members.annotate(payment_count=Count('payment')).filter(payment_count = 0)
    for member in members:
        SmsMessage.objects.create(member=member, notification=instance)

@receiver(post_save, sender=SmsMessage)
def send_sms_message(sender, instance, created, *args, **kwargs):
    if created:
        from .tasks import send_sms
        send_sms.delay(instance.id)

