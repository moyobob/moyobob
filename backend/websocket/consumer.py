from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from django.core.cache import cache
import json

from .models import PartyState, PartyPhase
from api.models import Party, User, Restaurant, Menu
from websocket import event, exception

WEBSOCKET_REJECT_UNAUTHORIZED = 4000
WEBSOCKET_REJECT_DUPLICATE = 4001
WEBSOCKET_DISCONNECT_UNAUTHORIZED = 4010
WEBSOCKET_DISCONNECT_DUPLICATE = 4011


def get_party(party_id: int):
    try:
        party = Party.objects.get(id=party_id)
    except Party.DoesNotExist:
        raise exception.InvalidPartyError
    state = party.state

    if state is None:
        party.delete()
        raise exception.InvalidPartyError

    return (party, state)


def get_party_of_user(user_id: int):
    party_id = cache.get('user-party:{}'.format(user_id))

    if party_id is None:
        raise exception.NotJoinedError

    try:
        (party, state) = get_party(party_id)
    except exception.InvalidPartyError:
        cache.delete('user-party:{}'.format(user_id))
        raise

    return (party, state)


class WebsocketConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.commands = {
            'party.join': self.command_party_join,
            'party.leave': self.command_party_leave,
            'to.choosing.menu': self.command_to_choosing_menu,
            'to.ordering': self.command_to_ordering,
            'to.ordered': self.command_to_ordered,
            'to.payment': self.command_to_payment,
            'restaurant.vote.toggle': self.command_restaurant_vote_toggle,
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
            (party, state) = get_party_of_user(user.id)
        except exception.NotJoinedError:
            await self.send_json(
                event.initially_not_joined()
            )
            return

        await self.channel_layer.group_add(
            'party-{}'.format(party.id),
            self.channel_name,
        )
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

        try:
            await self.handle_command(msg)
        except exception.ConsumerException as e:
            await self.send_json(
                e.as_dict(),
            )

    async def handle_command(self, msg):
        command = self.commands.get(msg.get('command', None), None)

        if command is None:
            raise exception.InvalidCommandError

        try:
            await command(msg)
        except KeyError:
            raise exception.InvalidDataError

    async def command_party_join(self, msg):
        user = self.scope['user']
        user_id = user.id

        if cache.get('user-party:{}'.format(user_id)) is not None:
            raise exception.AlreadyJoinedError

        party_id = msg['party_id']

        (party, state) = get_party(party_id)

        # TODO: Check party permission

        state.member_ids.append(user_id)
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

        state.member_ids.remove(user_id)
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
                next_user_id = state.member_ids[0]
                user = User.objects.get(id=next_user_id)
                party.leader = user
                party.save()

                await self.send_json(
                    event.leader_change(next_user_id),
                )
        else:
            party.delete()

    async def command_to_choosing_menu(self, data):
        user = self.scope['user']
        user_id = user.id
        restaurant_id = data['restaurant_id']

        (party, state) = get_party_of_user(user_id)
        if party.leader.id != user_id:
            raise exception.NotAuthorizedError

        if not Restaurant.objects.filter(id=restaurant_id).exists():
            raise exception.InvalidRestaurantError

        state.phase = PartyPhase.ChoosingMenu
        state.restaurant_id = restaurant_id
        state.save()
        party.restaurant_id = restaurant_id
        party.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.state_update(state),
        )

    async def command_to_ordering(self, data):
        user = self.scope['user']
        user_id = user.id

        (party, state) = get_party_of_user(user_id)
        if party.leader.id != user_id:
            raise exception.NotAuthorizedError

        state.phase = PartyPhase.Ordering
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.state_update(state),
        )

    async def command_to_ordered(self, data):
        user = self.scope['user']
        user_id = user.id

        (party, state) = get_party_of_user(user_id)
        if party.leader.id != user_id:
            raise exception.NotAuthorizedError

        state.phase = PartyPhase.Ordered
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.state_update(state),
        )

    async def command_to_payment(self, data):
        user = self.scope['user']
        user_id = user.id
        paid_user_id = data['paid_user_id']

        (party, state) = get_party_of_user(user_id)
        if party.leader.id != user_id:
            raise exception.NotAuthorizedError

        if not User.objects.filter(id=paid_user_id):
            raise exception.InvalidUserError

        state.phase = PartyPhase.PaymentAndCollection
        state.paid_user_id = paid_user_id
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.state_update(state),
        )

    async def command_restaurant_vote_toggle(self, data):
        user = self.scope['user']
        user_id = user.id
        restaurant_id = data['restaurant_id']

        (party, state) = get_party_of_user(user_id)
        party_id = party.id

        if not Restaurant.objects.filter(id=restaurant_id).exists():
            raise exception.InvalidRestaurantError

        try:
            state.restaurant_votes.remove((user_id, restaurant_id))
            await self.channel_layer.group_send(
                'party-{}'.format(party_id),
                event.restaurant_unvote(user_id, restaurant_id),
            )
        except ValueError:
            state.restaurant_votes.append((user_id, restaurant_id))
            await self.channel_layer.group_send(
                'party-{}'.format(party_id),
                event.restaurant_vote(user_id, restaurant_id),
            )
        finally:
            state.save()

    async def command_menu_create(self, data):
        menu_id = data['menu_id']
        quantity = data['quantity']
        user_ids = data['user_ids']

        (party, state) = get_party_of_user(self.scope['user'].id)

        if not Menu.objects.filter(id=menu_id).exists():
            raise exception.InvalidMenuError
        if User.objects.filter(id__in=user_ids).count() != len(user_ids):
            raise exception.InvalidUserError

        menu_entry_id = state.menu_entries.add(menu_id, quantity, user_ids)
        state.save()

        await self.channel_layer.group_send(
            'party-{}'.format(party.id),
            event.menu_create(menu_entry_id, menu_id, quantity, user_ids),
        )

    async def command_menu_update(self, data):
        menu_entry_id = data['menu_entry_id']
        quantity = data['quantity']
        add_user_ids = data.get('add_user_ids') or []
        remove_user_ids = data.get('remove_user_ids') or []

        (party, state) = get_party_of_user(self.scope['user'].id)

        if User.objects.filter(id__in=add_user_ids).count() != len(add_user_ids):
            raise exception.InvalidUserError
        if User.objects.filter(id__in=remove_user_ids).count() != len(remove_user_ids):
            raise exception.InvalidUserError

        try:
            state.menu_entries.update(
                menu_entry_id, quantity, add_user_ids=add_user_ids, remove_user_ids=remove_user_ids)
        except KeyError:
            raise exception.InvalidMenuEntryError
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
            state.menu_entries.delete(menu_entry_id)
        except KeyError:
            raise exception.InvalidMenuEntryError
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

    async def restaurant_vote(self, data):
        user_id = data['user_id']
        restaurant_id = data['restaurant_id']

        await self.send_json(
            event.restaurant_vote(user_id, restaurant_id),
        )

    async def restaurant_unvote(self, data):
        user_id = data['user_id']
        restaurant_id = data['restaurant_id']

        await self.send_json(
            event.restaurant_unvote(user_id, restaurant_id),
        )

    async def menu_create(self, data):
        menu_entry_id = data['menu_entry_id']
        menu_id = data['menu_id']
        quantity = data['quantity']
        user_ids = data['user_ids']

        await self.send_json(
            event.menu_create(menu_entry_id, menu_id, quantity, user_ids)
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

    async def state_update(self, data):
        state = data['state']

        await self.send_json(
            event.state_update_dict(state)
        )
