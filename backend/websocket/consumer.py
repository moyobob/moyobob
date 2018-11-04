from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from django.core.cache import cache
import json

from .models import PartyState


WEBSOCKET_REJECT_UNAUTHORIZED = 4000
WEBSOCKET_REJECT_DUPLICATE = 4001
WEBSOCKET_DISCONNECT_UNAUTHORIZED = 4010
WEBSOCKET_DISCONNECT_DUPLICATE = 4011


class WebsocketConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.actions = {
            'party.join': self.party_join,
        }

    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close(WEBSOCKET_REJECT_UNAUTHORIZED)
            return

        cache_key = 'session:{}'.format(user.id)
        session = cache.get(cache_key)
        if session is None:
            cache.set(cache_key, self.channel_name)
        else:
            if session != self.channel_name:
                await self.channel_layer.send(session, {'type': 'close', 'code': WEBSOCKET_DISCONNECT_DUPLICATE})
                cache.set(cache_key, self.channel_name)

        await self.accept()

    async def disconnect(self):
        user = self.scope['user']
        if user.is_authenticated:
            session_cache_key = 'session:{}'.format(user.id)
            session = cache.get(session_cache_key)
            if session is not None and session == self.channel_name:
                cache.delete(session_cache_key)

            user_party_cache_key = 'user-party:{}'.format(user.id)
            party_id = cache.get(user_party_cache_key)
            if party_id is not None:
                self.channel_layer.group_send(
                    'party-{}'.format(party_id),
                    {
                        'type': 'party.leave',
                        'user_id': user.id,
                    }
                )

    async def receive_json(self, msg):
        action = self.actions.get(msg.get('action', None), None)

        if action is not None:
            await action(msg)

    async def party_join(self, msg):
        print('party join!: {}'.format(msg))
