from django.urls import path
from api import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('signout/', views.signout, name='signout'),
    path('verify_session/', views.verify_session, name='verify_session'),
    path('party/<int:party_id>/', views.party_detail, name='party_detail'),
    path('party/', views.party, name='party'),
    path('restaurant/<int:restaurant_id>/menu/', views.menu, name='menu'),
    path('restaurant/<int:restaurant_id>/',
         views.restaurant_detail, name='restaurant_detail'),
    path('menu/<int:menu_id>/', views.menu_detail, name='menu_detail'),
    path('party_records/', views.party_records, name='party_records'),
    path('payments/', views.payments, name='payments'),
    path('collections/', views.collections, name='collections'),
    path('resolve_payment/<int:payment_id>/',
         views.resolve_payment, name='resolve_payment'),
]
