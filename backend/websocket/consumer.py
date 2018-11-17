from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from django.core.cache import cache
import json

from .models import PartyState
from api.models import Party, User
from websocket import event
from .exception import NotInPartyError, AlreadyJoinedError

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
            'menu.create': self.command_menu_create,
            'menu.update': self.command_menu_update,
            'menu.delete': self.command_menu_delete,
        }

    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close(WEBSOCKET_REJECT_UNAUTHORIZED)
            return

        await self.accept()

        try:
            (_, state) = get_party_of_user(user.id)
        except NotInPartyError:
            await self.send_json(
                event.initially_not_joined()
            )
            return

        await self.send_json(
            event.state_update(state)
        )

    async def disconnect(self, _):
        user = self.scope['user']
        if not user.is_authenticated:
            return

        party_id = cache.get('user-party:{}'.format(user.id))
        if party_id is None:
            return

        await self.channel_layer.group_discard(
            'party-{}'.format(party_id),
            self.channel_name,
        )

    async def receive_json(self, msg):
        if not self.scope['user'].is_authenticated:
            await self.close(WEBSOCKET_DISCONNECT_UNAUTHORIZED)
            return

        command = self.commands.get(msg.get('command', None), None)

        if command is not None:
            try:
                await command(msg)
            except KeyError:
                await self.send_json(event.error.invalid_data())
            except Party.DoesNotExist:
                await self.send_json(event.error.invalid_party())
            except NotInPartyError:
                await self.send_json(event.error.not_joined())
            except AlreadyJoinedError:
                await self.send_json(event.error.already_joined())
        else:
            await self.send_json(event.error.invalid_command())

    async def command_party_join(self, msg):
        user = self.scope['user']
        user_id = user.id

        if cache.get('user-party:{}'.format(user_id)) is not None:
            raise AlreadyJoinedError

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

            if party.leader.id == user_id:
                next_user_id = state.members[0]
                user = User.objects.get(id=next_user_id)
                party.leader = user
                party.save()

                await self.send_json(
                    event.leader_change(next_user_id),
                )
        else:
            party.delete()

    async def command_menu_create(self, data):
        menu_id = data['menu_id']
        quantity = data['quantity']
        users = data['users']

        (party, state) = get_party_of_user(self.scope['user'].id)

        menu_entry_id = state.menus.add(menu_id, quantity, users)
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.menu_create(menu_entry_id, menu_id, quantity, users),
        )

    async def command_menu_update(self, data):
        menu_entry_id = data['menu_entry_id']
        quantity = data['quantity']
        add_user_ids = data.get('add_user_ids') or []
        remove_user_ids = data.get('remove_user_ids') or []

        (party, state) = get_party_of_user(self.scope['user'].id)

        try:
            state.menus.update(
                menu_entry_id, quantity, add_users=add_user_ids, remove_users=remove_user_ids)
        except KeyError:
            await self.send_json(
                event.error.invalid_menu_entry()
            )
            return
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.menu_update(menu_entry_id, quantity,
                              add_user_ids, remove_user_ids),
        )

    async def command_menu_delete(self, data):
        menu_entry_id = data['menu_entry_id']

        (party, state) = get_party_of_user(self.scope['user'].id)

        try:
            state.menus.delete(menu_entry_id)
        except KeyError:
            await self.send_json(
                event.error.invalid_menu_entry()
            )
            return
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.menu_delete(menu_entry_id)
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

    async def menu_create(self, data):
        menu_entry_id = data['menu_entry_id']
        menu_id = data['menu_id']
        quantity = data['quantity']
        users = data['users']

        await self.send_json(
            event.menu_create(menu_entry_id, menu_id, quantity, users)
        )

    async def menu_update(self, data):
        menu_entry_id = data['menu_entry_id']
        quantity = data['quantity']
        add_user_ids = data['add_user_ids']
        remove_user_ids = data['remove_user_ids']

        await self.send_json(
            event.menu_update(menu_entry_id, quantity,
                              add_user_ids, remove_user_ids)
        )

    async def menu_delete(self, data):
        menu_entry_id = data['menu_entry_id']

        await self.send_json(
            event.menu_delete(menu_entry_id)
        )
