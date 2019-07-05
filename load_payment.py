import xlrd,openpyxl,re
from django.conf import settings
from core.models import Member,Payment
import datetime
from dateutil.relativedelta import relativedelta

workbook = xlrd.open_workbook('WELFARE FINANCE DATA 2016 updated.xlsx')
wb_unsaved = openpyxl.Workbook()

ws2016 = wb_unsaved.active
ws2016.title = 'WELFARE DATA 2016'
ws2016.column_dimensions['A'].width = 30
ws2017 = wb_unsaved.create_sheet(title='WELFARE DATA 2017')
ws2017.column_dimensions['A'].width = 30
ws2018 = wb_unsaved.create_sheet(title='WELFARE DATA 2018')
ws2018.column_dimensions['A'].width = 30
ws2019 = wb_unsaved.create_sheet(title='WELFARE DATA 2019')
ws2019.column_dimensions['A'].width = 30
wb_unsaved.save('UNSAVED WELFARE FINANCE.xlsx')
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

def format_name(name):
	if not name:
		return ''
	names = name.split(' ')
	if len(names) >= 3:
		names[1] = names[1] if names[1][-1].isalpha() else names[1][:-1]
		return ' '.join(names)
	elif len(names) == 2:
		if names[1].find('.') != -1:
			return names[0] + ' ' + names[1].split('.')[0] + ' ' + names[1].split('.')[1]
		else:
			return names[0] + ' ' + names[1] + ' ' + names[1]
	else:
		return name

def read_2016():
	sheet = workbook.sheet_by_index(6)
	re_s = re.compile(' +')
	for i in range(1,sheet.nrows):
		r = sheet.row(i)
		name = re_s.sub(' ',r[0].value.strip())
		if not name or not name[0].isalpha():
				continue
		name =format_name(name)
		names = name.split(' ')
		if len(names) == 2:
			names += ['']
		member = search_name(name)
		if member and member.first_name == names[0] and (member.middle_name == names[1] or member.last_name == names[2]):
			for index,col in enumerate(r[2:-1]):
				if col.value:
					Payment.objects.create(member=member,amount=col.value,method='CA',
						date=datetime.date(2016,index+1,1),
						period=datetime.date(2016,index+1,1))
		else:
			print(name)

def make_payment(member,amount,year,month):
	if year == 2016:
		Payment.objects.create(member=member,amount=amount,method='CA',
						date=datetime.date(2016,month,1),
						period=datetime.date(2016,month,1))
		return
	last_payment = Payment.objects.filter(member=member,period__year__gt=2016).last()
	last_payment_date = None
	if last_payment:
		last_payment_date = last_payment.period
		if last_payment.amount < 200:
		  rem = 200 - last_payment.amount
		  amount -= rem
		  last_payment.amount = 200
		  last_payment.save()
	else:
		if month == 1:
			month = 12
			year -= 1
		else:
			month -= 1
		last_payment_date = datetime.date(year,month,1)


	date = datetime.date(year,month,1)
	period = None
	for i in range(int(amount / 200)):
	  period = last_payment_date + relativedelta(months=+1,day=1)
	  p = Payment.objects.create(member=member,
	    method='CA',
	    amount=200,
	    period=period,
	    date=date)
	  last_payment_date = period
	if amount % 200 != 0:
		rem = amount % 200
		period = last_payment_date + relativedelta(months=+1,day=1)
		p = Payment.objects.create(member=member,
	    method='CA',
	    amount=rem,
	    period=period,
	    date=date)

def read():
	for sheet_index in range(6,10):
		sheet = workbook.sheet_by_index(sheet_index)
		sheet_unsaved = wb_unsaved.worksheets[sheet_index - 6]
		year = [2016,2017,2018,2019][sheet_index-6]
		re_s = re.compile(' +')
		for i in range(1,sheet.nrows):
			r = sheet.row(i)
			name = re_s.sub(' ',r[0].value.strip())
			if not name or not name[0].isalpha():
				continue
			name = format_name(name)
			names = name.split(' ')
			if len(names) == 2:
				names += ['']
			member = search_name(name)
			if member and member.first_name == names[0] and (member.middle_name == names[1] or member.last_name == names[2]):
				for index,col in enumerate(r[2:-1]):
					if col.value:
						make_payment(member,col.value,year,index+1)
			else:
				sheet_unsaved.append([c.value for c in r])
				print(name)
		print('\n\n')
	wb_unsaved.save('UNSAVED WELFARE FINANCE.xlsx')