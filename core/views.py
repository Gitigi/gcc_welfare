from django.shortcuts import render
from django.contrib import auth
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets,status
from core.serializers import UserSerializer, MemberSerializer, PaymentSerializer, BankingSerializer, NoteSerializer, NotificationSerializer, LibrarySerializer, ClaimSerializer
from core.models import Member,Payment,Banking,Note, Notification, Library, Claim
import datetime
from dateutil.relativedelta import relativedelta
from django.db.models import Q,Sum,Max,F
from .utility import send_message


@ensure_csrf_cookie
@api_view(['GET', 'POST'])
def get_user(request):
    if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
    else:
        return Response({'username': None})


@api_view(['POST'])
def login(request):
    user = auth.authenticate(username=request.data["username"], password=request.data["password"])
    if user:
        auth.login(request, user)
        return Response(UserSerializer(user).data)
    else:
        return Response({'error':'Incorrect Username or Password'},status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def logout(request):
    auth.logout(request)
    return Response({})


@api_view(['GET'])
def annual_report(request):
    year = request.GET.get('year',datetime.datetime.today().year)
    p = Payment.objects.filter(period__year=year).values('period__month').annotate(total=Sum('amount'))
    return Response(list(p))

@api_view(['GET'])
def individual_report(request):
    p = Payment.objects.all()
    if request.GET.get('year'):
        p = p.filter(period__year=request.GET['year'])
    if request.GET.get('member'):
        p = p.filter(member=request.GET['member'])
    p = p.values('period__month','member','member__first_name','member__middle_name','member__last_name').annotate(total=Sum('amount'))
    return Response(list(p))


@api_view(['GET'])
def defaulters_report(request):
    today = datetime.datetime.today()
    #get list of member who have contributed for current period
    p = Payment.objects.filter(period__year=today.year,period__month=today.month).values_list('member')
    m = Member.objects.all().exclude(id__in=p).annotate(period=Max('payment__period')).values('id','first_name','middle_name','last_name','date_joined','period')
    return Response(list(m))

@api_view(['GET'])
def payment_report(request):
    p = Payment.objects.values('date','member','member__first_name','member__middle_name','member__last_name').annotate(total=Sum('amount'))
    
    if request.GET.get('member'):
        p = p.filter(member=request.GET['member'])
    return Response(list(p))

@api_view(['GET'])
def dashboard_summary(request):
    today = datetime.datetime.today()
    suspended = Member.objects.filter(suspended=True)
    active = Member.objects.filter(suspended=False)
    upto_date = Member.objects.all().filter(payment__period__year=today.year,payment__period__month=today.month).annotate(id_=Max('id')).filter(id = F('id_'))
    lagging = Member.objects.all().exclude(id__in=upto_date)
    #payment total per month for the last three years
    p1 = Payment.objects.filter(period__year=today.year-2).values('period__month').annotate(total=Sum('amount'))
    p2 = Payment.objects.filter(period__year=today.year-1).values('period__month').annotate(total=Sum('amount'))
    p3 = Payment.objects.filter(period__year=today.year).values('period__month').annotate(total=Sum('amount'))
    response = {
        'suspended': suspended.count(),
        'active': active.count(),
        'upto_date': upto_date.count(),
        'lagging': lagging.count(),
        'annual_report': {today.year-2: list(p1), today.year-1: list(p2), today.year: list(p3)}
    }
    return Response(response)

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

    def get_queryset(self):
        members = self.queryset
        today = datetime.datetime.today()
        #get list of member who have contributed for current period
        p = Payment.objects.filter(period__year=today.year,period__month=today.month).values_list('member')
        if self.request.GET.get('status'):
            if self.request.GET['status'] == 'active':
                members = members.filter(suspended=False)
            elif self.request.GET['status'] == 'suspended':
                members = members.filter(suspended=True)
            elif self.request.GET['status'] == 'upto-date':
                members = members.filter(suspended=False).filter(id__in = p)
            elif self.request.GET['status'] == 'lagging':
                members = members.filter(suspended=False).exclude(id__in = p)
        if self.request.GET.get('search'):
            members = members.filter(
                Q(first_name__startswith=self.request.GET.get('search')) |
                Q(middle_name__startswith=self.request.GET.get('search')) |
                Q(last_name__startswith=self.request.GET.get('search')))

        return members

class BankingViewSet(viewsets.ModelViewSet):
    queryset = Banking.objects.all()
    serializer_class = BankingSerializer

    def get_queryset(self):
        q = self.queryset
        if self.request.GET.get('year'):
            q = q.filter(date__year=self.request.GET['year'])
        if self.request.GET.get('month'):
            q = q.filter(date__month=self.request.GET['month'])
        if self.request.GET.get('search'):
            q = q.filter(
                Q(member__first_name__startswith=self.request.GET['search']) |
                Q(member__middle_name__startswith=self.request.GET['search']) |
                Q(member__last_name__startswith=self.request.GET['search']))
        return q

class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer

    def get_queryset(self):
        q = self.queryset
        if self.request.GET.get('year'):
            q = q.filter(date__year=self.request.GET['year'])
        if self.request.GET.get('month'):
            q = q.filter(date__month=self.request.GET['month'])
        if self.request.GET.get('search'):
            q = q.filter(
                Q(member__first_name__startswith=self.request.GET['search']) |
                Q(member__middle_name__startswith=self.request.GET['search']) |
                Q(member__last_name__startswith=self.request.GET['search']))
        return q

class LibraryViewSet(viewsets.ModelViewSet):
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer

    def create(self,request):
        serializer = LibrarySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors,status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'files': [serializer.data]})

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    def get_queryset(self):
        q = self.queryset
        if self.request.GET.get('member'):
            q = q.filter(member=self.request.GET['member'])
        return q

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def create(self,request):
        serializer = NotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors,status.HTTP_400_BAD_REQUEST)

        serializer.save()
        numbers = Member.objects.all().values_list('mobile_no')
        if request.data['target'] == 'individual':
            numbers = numbers.filter(id__in=request.data['contacts'].split(';'))
        else:
            today = datetime.datetime.today()
            #get list of member who have contributed for current period
            p = Payment.objects.filter(period__year=today.year,period__month=today.month).values_list('member')
            if request.data['status'] == 'active':
                numbers = numbers.filter(suspended=False)
            elif request.data['status'] == 'suspended':
                numbers = numbers.filter(suspended=True)
            elif request.data['contribution'] == 'up-to-date':
                numbers = numbers.filter(id__in=p)
            elif request.data['contribution'] == 'lagging':
                numbers = numbers.exclude(id__in=p)

        numbers = list(numbers)
        numbers = [n[0] for n in numbers]
        send_message(request.data['body'],numbers)
        return Response(serializer.data)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
    def get_queryset(self):
        q = self.queryset
        if self.request.GET.get('year'):
            q = q.filter(period__year=self.request.GET['year'])
        if self.request.GET.get('month'):
            q = q.filter(period__month=self.request.GET['month'])
        if self.request.GET.get('search'):
            q = q.filter(
                Q(member__first_name__startswith=self.request.GET['search']) |
                Q(member__middle_name__startswith=self.request.GET['search']) |
                Q(member__last_name__startswith=self.request.GET['search']))
        return q

    def create(self,request):
        res = dict(request.data)
        res['date'] = datetime.datetime.now()
        serializer = PaymentSerializer(data=res)
        if not serializer.is_valid():
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

        amount = int(request.data['amount'])
        last_payment = Payment.objects.filter(member=request.data['member']).last()
        last_payment_date = None
        if last_payment:
            if last_payment.amount < 200:
                rem = 200 - last_payment.amount
                amount -= rem
                last_payment.amount = 200
                last_payment.save()
            last_payment_date = last_payment.period
        else:
            member_date_joined = Member.objects.get(id=request.data['member']).date_joined
            last_payment_date = datetime.date(member_date_joined.year,member_date_joined.month,1)
            #subtract a month from date of joining.
            #so that payment begin on the month of joining
            last_payment_date += relativedelta(months=-1,day=1)

        
        payments = []
        date = datetime.datetime.today()
        period = None
        member = Member.objects.get(id=request.data['member'])
        for i in range(int(amount / 200)):
            period = last_payment_date + relativedelta(months=+1,day=1)
            p = Payment.objects.create(member=member,
                method=request.data['method'],
                amount=200,
                period=period,
                date=date)
            payments.append(p)
            last_payment_date = period

        send_message("Thank you %s %s %s for your welfare payment of amount %d on %s" % 
            (member.first_name,member.middle_name,member.last_name,request.data['amount'],date), member.mobile_no)
        
        return Response(PaymentSerializer(payments,many=True).data)
