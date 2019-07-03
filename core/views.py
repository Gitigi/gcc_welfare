from django.shortcuts import render
from django.contrib import auth
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets,status
from core.serializers import UserSerializer, MemberSerializer,MemberSerializerMini, PaymentSerializer, BankingSerializer, NoteSerializer, NotificationSerializer, LibrarySerializer, ClaimSerializer, ChildSerializer
from core.models import Member,Payment,Banking,Note, Notification, Library, Claim, Child
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
def search_name(request):
    like_op = 'like' if 'sqlite' in settings.DATABASES['default']['ENGINE'].split('.')[-1] else 'ilike'
    name = request.GET.get('name','')
    names = name.split(' ')[:3]
    sql = ''
    args = []
    for i in names:
        sql += ' UNION ALL ' if len(sql) else ''
        sql += 'SELECT id FROM core_member WHERE (first_name '+like_op +' %s OR middle_name '+like_op +' %s  OR last_name '+like_op +' %s)'
        arg = '%s%%'%(i,)
        args += [arg,arg,arg]
    f = 'select count(id) count, id from (' + sql + ') a group by id order by count desc limit 10'
    return Response(MemberSerializerMini(Member.objects.raw(f,args),many=True).data)

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
    m = Member.objects.filter(dummy=False).exclude(id__in=p).annotate(period=Max('payment__period')).values('id','first_name','middle_name','last_name','date_joined','period')
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
    suspended = Member.objects.filter(dummy=False,suspended=True)
    active = Member.objects.filter(dummy=False,suspended=False)
    upto_date = Member.objects.all().filter(dummy=False,payment__period__year=today.year,payment__period__month=today.month).annotate(id_=Max('id')).filter(id = F('id_'))
    lagging = Member.objects.all().filter(dummy=False).exclude(id__in=upto_date)
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
                members = members.filter(dummy=False,suspended=False)
            elif self.request.GET['status'] == 'suspended':
                members = members.filter(dummy=False,suspended=True)
            elif self.request.GET['status'] == 'upto-date':
                members = members.filter(dummy=False,suspended=False).filter(id__in = p)
            elif self.request.GET['status'] == 'lagging':
                members = members.filter(dummy=False,suspended=False).exclude(id__in = p)
        if self.request.GET.get('search'):
            members = members.filter(
                Q(first_name__istartswith=self.request.GET.get('search')) |
                Q(middle_name__istartswith=self.request.GET.get('search')) |
                Q(last_name__istartswith=self.request.GET.get('search')))

        return members

    def create(self,request):
        serializer = MemberSerializer(data=request.data)
        serializer_children = ChildSerializer(data=request.data.get('children',[]),many=True)
        errors = {}
        if not serializer.is_valid():
            errors = serializer.errors

        serializer_spouse = None
        if(request.data.get('married')):
            if not request.data.get('spouse_details',{}) and not request.data.get('spouse'):
                errors['spouse_details'] = {'spouse': 'This field may not be blank'}
            else:
                serializer_spouse = self.validate_spouse_details(request.data)
                if serializer_spouse.errors:
                    errors['spouse_details'] = serializer_spouse.errors

        if not serializer_children.is_valid():
            errors['children'] = serializer_children.errors
        if errors:
            return Response(errors,status.HTTP_400_BAD_REQUEST)

        member = serializer.save()
        serializer_children.save()

        parent_role = 'father' if member.gender == 'M' else 'mother'
        for child in serializer_children.instance:
            setattr(child,parent_role,serializer.instance)
            child.save()

        self.update_spouse(serializer_spouse,member)
        return Response(MemberSerializer(serializer.instance).data)

    def update(self,request,pk):
        member = Member.objects.get(id=pk)
        serializer = MemberSerializer(member,request.data,partial=True)
        errors = {}
        if not serializer.is_valid():
            errors = serializer.errors
        
        serializer_spouse = None
        if(request.data.get('married')):
            if not request.data.get('spouse_details',{}) and not request.data.get('spouse'):
                errors['spouse_details'] = {'spouse': 'This field may not be blank'}
            else:
                serializer_spouse = self.validate_spouse_details(request.data)
                if serializer_spouse.errors:
                    errors['spouse_details'] = serializer_spouse.errors

        c = self.validate_children(request.data.get('children',[]),member)
        if c[0]:
            errors['children'] = c[1]
        if errors:
            return Response(errors,status.HTTP_400_BAD_REQUEST)

        member = serializer.save()
        #update children first to prevent any children created due to marriage from being deleted
        self.update_children(c[2],serializer.instance)
        self.update_spouse(serializer_spouse,member)
        print(MemberSerializer(member).data)
        return Response(MemberSerializer(member).data)

    def validate_spouse_details(self,data):
        serializer = None
        if data.get('spouse_details'):
            serializer = MemberSerializer(data=data['spouse_details'])
        else:
            serializer = MemberSerializer(Member.objects.get(id=data['spouse']),data={},partial=True)
        serializer.is_valid()
        return serializer

    def update_spouse(self,serializer,member):
        if serializer:
            if not serializer.instance:
                gender = 'M' if member.gender == 'F' else 'F'
                serializer.save(dummy=True,gender=gender)

            self.make_spouse(member,serializer.instance)
            
            spouse_role = 'father' if serializer.instance.gender == 'M' else 'mother'
            member_role = 'father' if member.gender == 'M' else 'mother'

            for c in Child.objects.filter(**{member_role: member}):
                if not getattr(c,spouse_role):
                    setattr(c,spouse_role,serializer.instance)
                    c.save()
            for c in list(Child.objects.filter(**{spouse_role: serializer.instance})):
                if not getattr(c,member_role):
                    setattr(c,member_role,member)
                    c.save()
        elif not member.spouse:
            spouse = Member.objects.filter(spouse=member).first()
            if spouse:
                spouse.spouse = None
                spouse.save()

    def make_spouse(self,s1,s2):
        #clear s2 ex
        s = Member.objects.filter(spouse=s1).first()
        if s:
            s.spouse = None
            s.save()
        #clear s2 ex
        s = Member.objects.filter(spouse=s2).first()
        if s:
            s.spouse = None
            s.save()

        s1.spouse = s2
        s1.save()

        s2.spouse = s1
        s2.save()


    def update_children(self,serializers,member):
        #check for missing children - those that have been deleted
        children_ids = list(map(lambda x: not getattr(x,'many',False) and x.validated_data.get('id'),serializers))
        children_ids = list(filter(lambda x: x,children_ids))
        children_objs = getattr(member,'fathered' if member.gender == 'M' else 'mothered').all().values('id')
        children_objs_id = [c['id'] for c in list(children_objs)]
        deleted_children_ids =  set(children_objs_id).difference(set(children_ids))
        Child.objects.filter(id__in=deleted_children_ids).delete()

        data = []
        for s in serializers:
            if s.instance:
                s.save()
                data.append(s.data)
            else:
                parent_role = 'father' if member.gender == 'M' else 'mother'
                parent = {parent_role: member}
                if member.spouse:
                    parent['father' if parent_role == 'mother' else 'mother'] = member.spouse
                s_obj = s.save(**parent)
                data += s.data if type(s.data) == type([]) else [s.data]
        return data

    def validate_children(self,children,member):
        existing_children = list(filter(lambda x: x.get('id'),children))
        new_children = list(filter(lambda x: not x.get('id'),children))
        existing_children_serializer = list(map(lambda x: ChildSerializer(Child.objects.get(id=x['id']),x,partial=True),existing_children))
        new_children_serializer = ChildSerializer(data=new_children,many=True)
        existing_children_error = list(map(lambda x: (x.is_valid() or True) and x.errors,existing_children_serializer))
        new_children_serializer.is_valid()
        errors = existing_children_error + new_children_serializer.errors
        serializers = existing_children_serializer + [new_children_serializer]
        has_error =  True in [bool(a) for a in errors]
        return (has_error,errors,serializers)


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
        numbers = Member.objects.filter(dummy=False).values_list('mobile_no')
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

        if amount % 200 != 0:
            rem = amount % 200
            period = last_payment_date + relativedelta(months=+1,day=1)
            p = Payment.objects.create(member=member,
                method=request.data['method'],
                amount=rem,
                period=period,
                date=date)

        send_message("Thank you %s %s %s for your welfare payment of amount %d on %s" % 
            (member.first_name,member.middle_name,member.last_name,request.data['amount'],date), member.mobile_no)
        
        return Response(PaymentSerializer(payments,many=True).data)
