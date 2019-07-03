import xlrd,re
from core.serializers import MemberSerializer
from core.models import Member,Child
from django.conf import settings
workbook = xlrd.open_workbook('GCCWELFARE DATABASE.xlsx')
sheet = workbook.sheet_by_index(0)
sheet.cell(1,1)

def get_detail(row):
	r = sheet.row(row)
	re_s = re.compile(' +')
	return {'name':re_s.sub(' ',r[1].value.strip()),
		'salutation': r[0].value,
		'gender': r[24].value,
		'id_no': r[2].value,
		'addr': str(r[3].value).strip().replace(' ','-',-1),
		'mobile_no':r[4].value,
		'email':r[5].value.strip(),
		'nhif_no':r[6].value,
		'spouse':re_s.sub(' ',r[7].value.strip()),
		'spouse_id_no':r[8].value,
		'spouse_mobile_no':r[9].value,
		'children': [re_s.sub(' ',r[10].value.strip()),re_s.sub(' ',r[12].value.strip()),re_s.sub(' ',r[14].value.strip()),re_s.sub(' ',r[16].value.strip()),re_s.sub(' ',r[18].value.strip()),re_s.sub(' ',r[20].value)],
		'father':re_s.sub(' ',r[22].value.strip()),
		'mother':re_s.sub(' ',r[23].value.strip())}
def format_name(info):
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
def format_other_names(name):
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
def format_address(addr):
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
def format_spouse(info):
	d = {'id_no': info['spouse_id_no'],
		'mobile_no': info['spouse_mobile_no']}
	d.update(format_other_names(info['spouse']))
	return d
def format_children(info):
	children = []
	for c in info['children']:
		children.append(format_other_names(c))
	return {'children': children}
def format_parent(info):
	d = {}
	if info['father']:
		father = format_other_names(info['father'])
		d.update({'father_first_name': father['first_name'],
			'father_middle_name': father['middle_name'],
			'father_last_name': father['last_name']})
	if info['mother']:
		mother = format_other_names(info['mother'])
		d.update({'mother_first_name': mother['first_name'],
			'mother_middle_name': mother['middle_name'],
			'mother_last_name': mother['last_name']})
	return d
def format_details(info):
	data = {
		'id_no': info['id_no'],
		'salutation': info['salutation'],
		'gender': info['gender'],
		'email': info['email'],
		'mobile_no': info['mobile_no'],
		'email': info['email'],
		'nhif_no': info['nhif_no']}
	data.update(format_name(info))
	data.update(format_address(info['addr']))
	data.update({'spouse_details':format_spouse(info)})
	data.update(format_children(info))
	data.update(format_parent(info))
	return data


def read():
	for i in range(1,sheet.nrows):
		r = get_detail(i)
		m = MemberSerializer(data=format_details(r))
		if not m.is_valid():
			print(i,m.errors)
		else:
			m.save()


def search_name(name):
	if not name:
		return None
	like_op = 'like' if 'sqlite' in settings.DATABASES['default']['ENGINE'].split('.')[-1] else 'ilike'
	names = name.split(' ')[:3]
	sql = ''
	args = []
	for i in names:
		sql += ' UNION ALL ' if len(sql) else ''
		sql += 'SELECT id FROM core_member WHERE (first_name '+like_op +' %s OR middle_name '+like_op +' %s  OR last_name '+like_op +' %s)'
		arg = '%s%%'%(i,)
		args += [arg,arg,arg]
	f = 'select count(id) count, id from (' + sql + ') a group by id order by count desc limit 10'
	s = list(Member.objects.raw(f,args))
	if len(s):
		return s[0]
	else:
		return None


def update_spouse(member1,member2):
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

def set_spouse():
	for i in range(1,147):
		r = get_detail(i)
		f = format_details(r)
		m = search_name(f['first_name'] + ' ' + f['middle_name'] + ' ' +f['last_name'])
		if m.spouse:
			continue
		for child in f['children']:
			if child:
				m_role = 'father' if m.gender == 'M' else 'mother'
				child_obj = Child(first_name=child['first_name'],middle_name=child['middle_name'])
				setattr(child_obj,m_role,m)
				child_obj.save()
		if f['spouse_details'].get('first_name') and len(r['spouse'].strip().split(' ')) > 1:
			s = search_name(f['spouse_details']['first_name'] + ' ' + f['spouse_details']['middle_name'] + ' ' +f['spouse_details']['last_name'])
			if s and s.first_name == f['spouse_details']['first_name'] and (s.middle_name == f['spouse_details']['middle_name'] or s.last_name == f['spouse_details']['last_name']):
				update_spouse(m,s)
			else:
				serializer_spouse = MemberSerializer(data=f['spouse_details'])
				if serializer_spouse.is_valid():
					serializer_spouse.save(dummy=True)
					update_spouse(m,serializer_spouse.instance)
				else:
					print(f,'spouse details invalid ',serializer_spouse.errors)
