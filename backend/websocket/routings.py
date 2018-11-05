from django.urls import path
from channels.routing import ChannelNameRouter, URLRouter

from .consumer import WebsocketConsumer

routing_table = URLRouter([
    path('party/', WebsocketConsumer),
])
