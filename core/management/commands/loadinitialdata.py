from django.core.management.base import BaseCommand,CommandError
from ._private_load_members import LoadMembers
from ._private_load_payment import LoadPayment

class Command(BaseCommand):
	help = 'Loads initial data from 2016 to mid 2019'

	def handle(self,*args,**options):
		self.stdout.write('loading data')
		member_loader = LoadMembers()
		payment_loader = LoadPayment()
		self.stdout.write(self.style.SUCCESS('loading members...'))
		member_loader.load()
		self.stdout.write(self.style.SUCCESS('loading payments...'))
		payment_loader.load()