import xlrd,re
from core.serializers import MemberSerializer
from core.models import Member,Child,Payment
from core import utility
from django.conf import settings
import os

class LoadMembers:
	def __init__(self):
		self.workbook = xlrd.open_workbook(os.path.join(os.path.dirname(os.path.abspath(__file__)),'GCCWELFARE DATABASE.xlsx'))
		self.sheet = self.workbook.sheet_by_index(0)
	def get_detail(self,row):
		r = self.sheet.row(row)
		re_s = re.compile(' +')
		return {'name':re_s.sub(' ',r[1].value.strip()),
			'salutation': r[0].value,
			'gender': r[2].value,
			'id_no': r[3].value,
			'addr': str(r[4].value).strip().replace(' ','-',-1),
			'mobile_no':r[5].value,
			'email':r[6].value.strip(),
			'nhif_no':r[7].value,
			'spouse':re_s.sub(' ',r[8].value.strip()),
			'spouse_id_no':r[9].value,
			'spouse_mobile_no':r[10].value,
			'children': [re_s.sub(' ',r[11].value.strip()),re_s.sub(' ',r[13].value.strip()),re_s.sub(' ',r[15].value.strip()),re_s.sub(' ',r[17].value.strip()),re_s.sub(' ',r[19].value.strip()),re_s.sub(' ',r[21].value)],
			'father':re_s.sub(' ',r[23].value.strip()),
			'mother':re_s.sub(' ',r[24].value.strip())}

	def search_name(self,name):
		if not name:
			return None
		s = list(utility.search_name(name))
		if len(s):
			return s[0]
		else:
			return None

	def format_name(self,info):
		name = info['name'].split(' ')
		if len(name) >= 3:
			return {
				'first_name': name[0],
				'middle_name': name[1] if name[1][-1].isalpha() else name[1][:-1],
				'last_name': name[2]}
		elif len(name) == 2:
			if name[1].find('.') != -1:
				return {
					'first_name': name[0],
					'middle_name': name[1].split('.')[0],
					'last_name': name[1].split('.')[1]}
			elif info['father'] and len(info['father'].split(' ')) > 1:
				return {
					'first_name': name[0],
					'middle_name': name[1],
					'last_name': info['father'].split(' ')[1]}
			else:
				return {
					'first_name': name[0],
					'middle_name': name[1],
					'last_name': name[1]}
	def format_other_names(self,name):
		if not name:
			return {}
		name = name.split(' ')
		if len(name) >= 3:
			return {
				'first_name': name[0],
				'middle_name': name[1] if name[1][-1].isalpha() else name[1][:-1],
				'last_name': name[2]}
		elif len(name) == 2:
			if name[1].find('.') != -1:
				return {
					'first_name': name[0],
					'middle_name': name[1].split('.')[0],
					'last_name': name[1].split('.')[1]}
			else:
				return {
					'first_name': name[0],
					'middle_name': name[1],
					'last_name': name[1]}
		else:
			return {
				'first_name': name[0],
				'middle_name': name[0],
				'last_name': name[0]}
	def format_address(self,addr):
		addr = addr.split('-')
		if len(addr) == 3:
			return {'address': addr[0],'code':addr[1],'city':addr[2]}
		elif len(addr) == 2:
			if addr[1].isalpha():
				return {'address': addr[0],'city': addr[1]}
			else:
				return {'address': addr[0],'code': addr[1]}
		elif addr:
			return {'address': addr[0]}
		else:
			return {}
	def format_spouse(self,info):
		d = {'id_no': info['spouse_id_no'],
			'mobile_no': info['spouse_mobile_no']}
		d.update(self.format_other_names(info['spouse']))
		return d
	def format_children(self,info):
		children = []
		for c in info['children']:
			children.append(self.format_other_names(c))
		return {'children': children}

	def format_parent(self,info):
		d = {}
		if info['father']:
			father = self.format_other_names(info['father'])
			d.update({'father_first_name': father['first_name'],
				'father_middle_name': father['middle_name'],
				'father_last_name': father['last_name']})
		if info['mother']:
			mother = self.format_other_names(info['mother'])
			d.update({'mother_first_name': mother['first_name'],
				'mother_middle_name': mother['middle_name'],
				'mother_last_name': mother['last_name']})
		return d
	def format_details(self,info):
		data = {
			'id_no': info['id_no'],
			'salutation': info['salutation'],
			'gender': info['gender'],
			'email': info['email'],
			'mobile_no': info['mobile_no'],
			'email': info['email'],
			'nhif_no': info['nhif_no']}
		data.update(self.format_name(info))
		data.update(self.format_address(info['addr']))
		data.update({'spouse_details':self.format_spouse(info)})
		data.update(self.format_children(info))
		data.update(self.format_parent(info))
		return data


	def update_spouse(self,member1,member2):
	  if member1.spouse and member1.spouse == member2.spouse:
	  	return

	  if member1.spouse and member1.spouse.dummy:
	  	member1.spouse.delete()
	  if member2.spouse and member2.spouse.dummy:
	  	member2.spouse.delete()

	  member1.spouse = member2
	  member1.save()
	  member2.spouse = member1
	  member2.save()

	  member1_role = 'father' if member1.gender == 'M' else 'mother'
	  member2_role = 'father' if member2.gender == 'M' else 'mother'

	  for c in list(Child.objects.filter(**{member1_role: member1})):
	      if not getattr(c,member2_role):
	          setattr(c,member2_role,member2)
	          c.save()
	  for c in list(Child.objects.filter(**{member2_role: member2})):
	      if not getattr(c,member1_role):
	          setattr(c,member1_role,member1)
	          c.save()

	def set_spouse(self):
		for i in range(1,self.sheet.nrows):
			r = self.get_detail(i)
			f = self.format_details(r)
			m = self.search_name(f['first_name'] + ' ' + f['middle_name'] + ' ' +f['last_name'])
			if m.spouse:
				continue
			for child in f['children']:
				if child:
					m_role = 'father' if m.gender == 'M' else 'mother'
					child_obj = Child(first_name=child['first_name'],middle_name=child['middle_name'])
					setattr(child_obj,m_role,m)
					child_obj.save()
			if f['spouse_details'].get('first_name') and len(r['spouse'].strip().split(' ')) > 1:
				s = self.search_name(f['spouse_details']['first_name'] + ' ' + f['spouse_details']['middle_name'] + ' ' +f['spouse_details']['last_name'])
				if s and s.first_name.lower() == f['spouse_details']['first_name'].lower() and (s.middle_name.lower() == f['spouse_details']['middle_name'].lower() or s.last_name.lower() == f['spouse_details']['last_name'].lower()):
					self.update_spouse(m,s)
				else:
					serializer_spouse = MemberSerializer(data=f['spouse_details'])
					if serializer_spouse.is_valid():
						serializer_spouse.save(dummy=True)
						self.update_spouse(m,serializer_spouse.instance)
					else:
						print(f,'spouse details invalid ',serializer_spouse.errors)


	def load(self):
		for i in range(1,self.sheet.nrows):
			r = self.get_detail(i)
			m = MemberSerializer(data=self.format_details(r))
			if not m.is_valid():
				print(i,m.errors)
			else:
				m.save()
		self.set_spouse()