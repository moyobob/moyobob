from django.urls import path
from api import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('signout/', views.signout, name='signout'),
    path('verify_session/', views.verify_session, name='verify_session'),
    path('party/', views.party, name='party'),
]
