from django.core.management.base import BaseCommand,CommandError
from ._private_load_members import LoadMembers
from ._private_load_payment import LoadPayment

class Command(BaseCommand):
	help = 'Loads initial data from 2016 to mid 2019'

	def add_arguments(self,parser):
		parser.add_argument('-m','--members',action='store_true',help='load only members information')
		parser.add_argument('-p','--payments',action='store_true',help='load only payments information')

	def handle(self,*args,**options):
		self.stdout.write('loading data')
		member_loader = LoadMembers()
		payment_loader = LoadPayment()
		members_only = options['members']
		payments_only = options['payments']
		if members_only:
			self.stdout.write(self.style.SUCCESS('loading members...'))
			member_loader.load()
		elif payments_only:
			self.stdout.write(self.style.SUCCESS('loading payments...'))
			payment_loader.load()
		else:
			self.stdout.write(self.style.SUCCESS('loading members...'))
			member_loader.load()
			self.stdout.write(self.style.SUCCESS('loading payments...'))
			payment_loader.load()