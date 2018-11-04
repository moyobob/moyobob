from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from django.core.cache import cache
import json

from .models import PartyState
from api.models import Party

WEBSOCKET_REJECT_UNAUTHORIZED = 4000
WEBSOCKET_REJECT_DUPLICATE = 4001
WEBSOCKET_DISCONNECT_UNAUTHORIZED = 4010
WEBSOCKET_DISCONNECT_DUPLICATE = 4011


def error(cause):
    return {
        'type': 'error',
        'error': cause,
    }


class WebsocketConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.commands = {
            'party.join': self.command_party_join,
            'party.leave': self.command_party_leave,
        }

    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close(WEBSOCKET_REJECT_UNAUTHORIZED)
            return

        await self.accept()
        await self.send_json({
            'type': 'success',
            'event': 'connect',
        })

    async def receive_json(self, msg):
        if not self.scope['user'].is_authenticated:
            await self.close(WEBSOCKET_DISCONNECT_UNAUTHORIZED)
            return

        command = self.commands.get(msg.get('command', None), None)

        if command is not None:
            await command(msg)
        else:
            await self.send_json(error('Invalid command'))

    async def command_party_join(self, msg):
        user = self.scope['user']
        user_id = user.id

        try:
            party_id = msg['party_id']
        except KeyError:
            await self.send_json(error('Invalid data'))
            return

        try:
            party = Party.objects.get(id=party_id)
        except Party.DoesNotExist:
            await self.send_json(error('Party does not exist'))
            return

        # TODO: Check party permission

        state = party.state

        if state is None:
            party.delete()
            await self.send_json(error('Party does not exist'))
            return

        state.members.append(user_id)
        party.member_count += 1
        state.save()
        party.save()
        cache.set('user-party:{}'.format(user_id), party_id)

        await self.channel_layer.group_send(
            'party-{}'.format(party_id),
            {
                'type': 'party.join',
                'user_id': user_id,
            }
        )
        await self.channel_layer.group_add(
            'party-{}'.format(party_id),
            self.channel_name,
        )
        await self.send_json({
            'type': 'success',
            'event': 'party.join',
        })

    async def command_party_leave(self, msg):
        user = self.scope['user']
        user_id = user.id

        party_id = cache.get('user-party:{}'.format(user_id))

        if party_id is None:
            await self.send_json(error('You are currently not in the room'))
            return

        try:
            party = Party.objects.get(id=party_id)
        except Party.DoesNotExist:
            await self.send_json(error('Party does not exist'))
            return

        state = party.state

        if state is None:
            party.delete()
        else:
            state.members.remove(user_id)
            party.member_count -= 1
            state.save()
            party.save()
            cache.delete('user-party:{}'.format(user_id))

            await self.channel_layer.group_discard(
                'party-{}'.format(party_id),
                self.channel_name,
            )

            if party.member_count > 0:
                await self.channel_layer.group_send(
                    'party-{}'.format(party_id),
                    {
                        'type': 'party.leave',
                        'user_id': user_id,
                    }
                )
            else:
                party.delete()

        await self.send_json({
            'type': 'success',
            'event': 'party.leave',
        })

    async def party_join(self, data):
        user_id = data['user_id']

        await self.send_json({
            'type': 'party.join',
            'user_id': user_id,
        })

    async def party_leave(self, data):
        user_id = data['user_id']

        await self.send_json({
            'type': 'party.leave',
            'user_id': user_id,
        })
