from django.urls import path,include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'members',views.MemberViewSet)
router.register(r'payments',views.PaymentViewSet)
router.register(r'banking',views.BankingViewSet)
router.register(r'notes',views.NoteViewSet)
router.register(r'notification',views.NotificationViewSet)
router.register(r'library',views.LibraryViewSet)
router.register(r'claim',views.ClaimViewSet)
router.register(r'expenditure',views.ExpenditureViewSet)

urlpatterns = [
    path('get-user', views.get_user, name='get-user'),
    path('login',views.login, name='login'),
    path('logout',views.logout, name='logout'),
    path('search-name/',views.search_name),
    path('annual-report/',views.annual_report),
    path('individual-report/',views.individual_report),
    path('defaulters-report/',views.defaulters_report),
    path('dashboard-summary/',views.dashboard_summary),
    path('payment-distribution/',views.payment_distribution),
    path('contribution-vs-claim',views.contribution_vs_claim),
    path('banking-report/',views.banking_report),
    path('resend-sms/<int:pk>', views.resend_sms),
    path('',include(router.urls))
]