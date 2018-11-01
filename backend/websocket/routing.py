from django.urls import path

from .consumer import PartyStateConsumer

websocket_urlpatterns = [
    path('ws/party/<int:party_id>/', PartyStateConsumer),
]
