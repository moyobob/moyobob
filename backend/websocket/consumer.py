from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from django.core.cache import cache
import json

from .models import PartyState
from api.models import Party
from websocket import event
from .exception import NotInPartyError

WEBSOCKET_REJECT_UNAUTHORIZED = 4000
WEBSOCKET_REJECT_DUPLICATE = 4001
WEBSOCKET_DISCONNECT_UNAUTHORIZED = 4010
WEBSOCKET_DISCONNECT_DUPLICATE = 4011


def get_party(party_id: int):
    party = Party.objects.get(id=party_id)
    state = party.state

    if state is None:
        party.delete()
        raise Party.DoesNotExist

    return (party, state)


def get_party_of_user(user_id: int):
    party_id = cache.get('user-party:{}'.format(user_id))

    if party_id is None:
        raise NotInPartyError

    try:
        (party, state) = get_party(party_id)
    except Party.DoesNotExist:
        cache.delete('user-party:{}'.format(user_id))
        raise

    return (party, state)


class WebsocketConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.commands = {
            'party.join': self.command_party_join,
            'party.leave': self.command_party_leave,
            'menu.assign': self.command_menu_assign,
            'menu.unassign': self.command_menu_unassign,
        }

    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close(WEBSOCKET_REJECT_UNAUTHORIZED)
            return

        await self.accept()

    async def receive_json(self, msg):
        if not self.scope['user'].is_authenticated:
            await self.close(WEBSOCKET_DISCONNECT_UNAUTHORIZED)
            return

        command = self.commands.get(msg.get('command', None), None)

        if command is not None:
            try:
                await command(msg)
            except KeyError:
                await self.send_json(event.error('Invalid data'))
            except Party.DoesNotExist:
                await self.send_json(event.error('Party does not exist'))
            except NotInPartyError:
                await self.send_json(event.error('You are currently not in the party'))
        else:
            await self.send_json(event.error('Invalid command'))

    async def command_party_join(self, msg):
        user = self.scope['user']
        user_id = user.id

        party_id = msg['party_id']

        (party, state) = get_party(party_id)

        # TODO: Check party permission

        state.members.append(user_id)
        party.member_count += 1
        state.save()
        party.save()
        cache.set('user-party:{}'.format(user_id), party_id)

        await self.channel_layer.group_send(
            'party-{}'.format(party_id),
            event.party_join(user_id),
        )
        await self.channel_layer.group_add(
            'party-{}'.format(party_id),
            self.channel_name,
        )
        await self.send_json(
            event.state_update(state)
        )

    async def command_party_leave(self, msg):
        user = self.scope['user']
        user_id = user.id

        (party, state) = get_party_of_user(user_id)
        party_id = party.id

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
                event.party_leave(user_id)
            )
        else:
            party.delete()

    async def command_menu_assign(self, data):
        user_id = data['user_id']
        menu_id = data['menu_id']

        (party, state) = get_party_of_user(self.scope['user'].id)

        if (user_id, menu_id) not in state.menus:
            state.menus.append((user_id, menu_id))
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.menu_assign(user_id, menu_id)
        )

    async def command_menu_unassign(self, data):
        user_id = data['user_id']
        menu_id = data['menu_id']

        (party, state) = get_party_of_user(self.scope['user'].id)

        if (user_id, menu_id) in state.menus:
            state.menus.remove((user_id, menu_id))
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.menu_unassign(user_id, menu_id)
        )

    async def party_join(self, data):
        user_id = data['user_id']

        await self.send_json(
            event.party_join(user_id)
        )

    async def party_leave(self, data):
        user_id = data['user_id']

        await self.send_json(
            event.party_leave(user_id)
        )

    async def menu_assign(self, data):
        user_id = data['user_id']
        menu_id = data['menu_id']

        await self.send_json(
            event.menu_assign(user_id, menu_id)
        )

    async def menu_unassign(self, data):
        user_id = data['user_id']
        menu_id = data['menu_id']

        await self.send_json(
            event.menu_unassign(user_id, menu_id)
        )
