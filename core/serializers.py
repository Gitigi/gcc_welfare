from django.contrib.auth.models import User
from rest_framework import serializers
from core.models import Member, Payment, Banking, Note, Notification, Library, Claim

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)

class MemberSerializer(serializers.ModelSerializer):
	class Meta:
		model = Member
		fields = ('id','first_name','middle_name','last_name','id_no','address','code','city',
			'mobile_no','email','nhif_no','spouse_first_name','spouse_middle_name','spouse_last_name','spouse_id_no','spouse_mobile_no',
			'children','father_first_name','father_middle_name','father_last_name',
			'mother_first_name','mother_middle_name','mother_last_name','reg','suspended','salutation','gender','dob','date_joined')

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
		fields = ('id','member','method','amount','date','period','first_name','middle_name','last_name','id_no','reg')


class NoteSerializer(serializers.ModelSerializer):
	class Meta:
		model = Note
		fields = ('id','member','note','date')

class NotificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Notification
		fields = ('id','heading','body','target','status','contribution','contacts','date')