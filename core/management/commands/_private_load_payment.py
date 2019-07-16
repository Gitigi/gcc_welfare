import xlrd,openpyxl,re
from django.conf import settings
from core.models import Member,Payment,Period
import datetime
from dateutil.relativedelta import relativedelta
from core import utility
import os

class LoadPayment:
	def __init__(self):
		self.workbook = xlrd.open_workbook(os.path.join(os.path.dirname(os.path.abspath(__file__)),'WELFARE FINANCE DATA 2016 updated.xlsx'))
		
		#used to store unsaved payment due to missing coresponding member in database
		# self.wb_unsaved_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),'UNSAVED WELFARE FINANCE.xlsx')
		# self.wb_unsaved = openpyxl.Workbook()
		# ws2016 = self.wb_unsaved.active
		# ws2016.title = 'WELFARE DATA 2016'
		# ws2016.column_dimensions['A'].width = 30
		# ws2017 = self.wb_unsaved.create_sheet(title='WELFARE DATA 2017')
		# ws2017.column_dimensions['A'].width = 30
		# ws2018 = self.wb_unsaved.create_sheet(title='WELFARE DATA 2018')
		# ws2018.column_dimensions['A'].width = 30
		# ws2019 = self.wb_unsaved.create_sheet(title='WELFARE DATA 2019')
		# ws2019.column_dimensions['A'].width = 30
		# self.wb_unsaved.save(self.wb_unsaved_path)

	def search_name(self,name):
		if not name:
			return None
		s = list(utility.search_name(name))
		if len(s):
			return s[0]
		else:
			return None
		
	def format_name(self,name):
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


	def make_payment(self,member,amount,year,month):
		payment = Payment.objects.create(member=member,amount=amount,method='CA',
							date=datetime.date(year,month,1))
		if year == 2016:
			p = Period.objects.create(payment=payment,amount=amount,period=datetime.date(2016,month,1))
			return
		last_period = Period.objects.filter(payment__member=member,period__year__gt=2016).last()
		last_period_date = None
		if last_period:
			last_period_date = last_period.period
			if last_period.amount < 200:
			  rem = 200 - last_period.amount
			  amount -= rem
			  last_period.amount = 200
			  last_period.save()
		else:
			if month == 1:
				month = 12
				year -= 1
			else:
				month -= 1
			last_period_date = datetime.date(year,month,1)


		date = datetime.date(year,month,1)
		period = None
		for i in range(int(amount / 200)):
		  period = last_period_date + relativedelta(months=+1,day=1)
		  p = Period.objects.create(payment=payment,amount=200,period=period)
		  last_period_date = period
		if amount % 200 != 0:
			rem = amount % 200
			period = last_period_date + relativedelta(months=+1,day=1)
			p = Period.objects.create(payment=payment,amount=rem,period=period)

	def load(self):
		for sheet_index in range(0,4):
			sheet = self.workbook.sheet_by_index(sheet_index)
			# sheet_unsaved = self.wb_unsaved.worksheets[sheet_index]
			year = [2016,2017,2018,2019][sheet_index]
			re_s = re.compile(' +')
			for i in range(1,sheet.nrows):
				r = sheet.row(i)
				name = re_s.sub(' ',r[0].value.strip())
				if not name or not name[0].isalpha():
					continue
				name = self.format_name(name)
				names = name.split(' ')
				if len(names) == 2:
					names += ['']
				member = self.search_name(name)
				if member and member.first_name == names[0] and (member.middle_name == names[1] or member.last_name == names[2]):
					for index,col in enumerate(r[2:-1]):
						if col.value:
							self.make_payment(member,col.value,year,index+1)
				else:
					# sheet_unsaved.append([c.value for c in r])
					print(name)
		# self.wb_unsaved.save(self.wb_unsaved_path)