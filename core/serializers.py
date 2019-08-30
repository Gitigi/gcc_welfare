from django.contrib.auth.models import User
from rest_framework import serializers
from core.models import Member, Child, Payment, Period, Banking, Note, Notification, Library, Claim, Expenditure

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)

class MemberSerializerMini(serializers.ModelSerializer):
	class Meta:
		model = Member 
		fields = ('id','first_name','middle_name','last_name','id_no')

class MemberSerializer(serializers.ModelSerializer):
	children = serializers.SerializerMethodField()
	spouse_info = serializers.SerializerMethodField()

	def get_children(self,obj):
		query = []
		if obj.gender == 'M':
			query = obj.fathered.all()
			if obj.spouse:
				query |= obj.spouse.mothered.all()
		else:
			query = obj.mothered.all()
			if obj.spouse:
				query |= obj.spouse.fathered.all()
		return ChildSerializer(query.order_by('dob'),many=True).data

	def get_spouse_info(self,obj):
		details = {}
		if obj.spouse:
			details = {
			'first_name': obj.spouse.first_name,
			'middle_name': obj.spouse.middle_name,
			'last_name': obj.spouse.last_name,
			'id_no': obj.spouse.id_no,
			'mobile_no': obj.spouse.mobile_no
			}
		return details
	class Meta:
		model = Member
		fields = ('id','first_name','middle_name','last_name','id_no','address','code','city',
			'mobile_no','email','nhif_no','spouse','spouse_info',
			'children','father_first_name','father_middle_name','father_last_name',
			'mother_first_name','mother_middle_name','mother_last_name','reg','suspended','salutation','gender','dob','date_joined','dummy')

class ChildSerializer(serializers.ModelSerializer):
	class Meta:
		model = Child
		fields = ('id','first_name','middle_name','dob','father','mother')

class BankingSerializer(serializers.ModelSerializer):
	class Meta:
		model = Banking
		fields = ('id','bank_name','account','amount','date','banked_by')

class ClaimSerializer(serializers.ModelSerializer):
	first_name = serializers.ReadOnlyField(source='member.first_name')
	middle_name = serializers.ReadOnlyField(source='member.middle_name')
	last_name = serializers.ReadOnlyField(source='member.last_name')
	class Meta:
		model = Claim
		fields = ('id','member','bank_name','account','amount','reason','disbursement','date','first_name','middle_name','last_name')

class LibrarySerializer(serializers.ModelSerializer):
	class Meta:
		model = Library
		fields = ('id','file')

class PaymentSerializer(serializers.ModelSerializer):
	first_name = serializers.ReadOnlyField(source='member.first_name')
	middle_name = serializers.ReadOnlyField(source='member.middle_name')
	last_name = serializers.ReadOnlyField(source='member.last_name')
	id_no = serializers.ReadOnlyField(source='member.id_no')
	reg = serializers.ReadOnlyField(source='member.reg')
	period = serializers.ReadOnlyField()
	class Meta:
		model = Payment
		fields = ('id','member','method','amount','ref_no','mobile_no','bank_name','date_of_payment','date','start_period','period','first_name','middle_name','last_name','id_no','reg')

class PeriodSerializer(serializers.ModelSerializer):
	payment__amount = serializers.ReadOnlyField(source='payment.amount')
	class Meta:
		model = Period
		fields = ('id','payment','amount','period','payment__amount')


class NoteSerializer(serializers.ModelSerializer):
	class Meta:
		model = Note
		fields = ('id','member','note','date')

class NotificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Notification
		fields = ('id','heading','body','target','status','contribution','contacts','date')

class ExpenditureSerializer(serializers.ModelSerializer):
	class Meta:
		model = Expenditure
		fields = ('id','name','amount','reason','date')