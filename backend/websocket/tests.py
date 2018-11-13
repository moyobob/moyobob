from django.test import TestCase, Client
from django.core.cache import cache
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
import asyncio
import json

from backend.routings import application
from .consumer import WebsocketConsumer
from api.models import Party, PartyType
from websocket import event


def async_test(coro):
    def wrapper(*args, **kwargs):
        future = coro(*args, **kwargs)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(future)
    return wrapper


class TestCaseWithCache(TestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        from django_redis import get_redis_connection
        get_redis_connection('default').flushdb()


class WebsocketConnectionTestCase(TestCaseWithCache):
    @async_test
    async def test_unauthenticated(self):
        communicator = WebsocketCommunicator(application, '/ws/party/')
        resp = await communicator.connect(1)
        self.assertTupleEqual(resp, (False, 4000))

    @async_test
    async def test_connect(self):
        user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.client.login(email=user.email, password='iluvrust')

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        self.assertEqual(communicator.instance.scope['user'], user)

        await communicator.disconnect()

    @async_test
    async def test_unauthenticated_during_connection(self):
        from django.contrib.auth.models import AnonymousUser

        user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.client.login(email=user.email, password='iluvrust')

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = user

        await communicator.connect()

        self.client.logout()
        communicator.scope['user'] = AnonymousUser()

        await communicator.send_json_to({
            'command': 'party.join',
            'foo': 'bar',
        })
        resp = await communicator.receive_output(1)
        self.assertEqual(resp['type'], 'websocket.close')
        self.assertEqual(resp['code'], 4010)

        await communicator.disconnect()


class SingleWebsocketTestCase(TestCaseWithCache):
    async def join(self):
        await self.communicator.send_json_to({
            'command': 'party.join',
            'party_id': self.party.id,
        })
        await self.communicator.receive_json_from(1)

    @async_test
    async def setUp(self):
        super().setUp()
        user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        party = Party(
            name="party 1 name",
            type=int(PartyType.Private),
            location="party 1 location",
            leader=user,
        )
        party.save()
        self.client.login(email=user.email, password='iluvrust')

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = user

        await communicator.connect()

        self.user = user
        self.party = party
        self.communicator = communicator

    @async_test
    async def tearDown(self):
        await self.communicator.disconnect()
        super().tearDown()

    @async_test
    async def test_invalid_command(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'foo',
            'data': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error('Invalid command'))

    @async_test
    async def test_invalid_data(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.join',
            'foo': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error('Invalid data'))

    @async_test
    async def test_party_join(self):
        user = self.user
        party = self.party
        communicator = self.communicator
        party_id = party.id

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        resp = await communicator.receive_json_from(1)

        party.refresh_from_db()
        self.assertDictEqual(resp, event.state_update(party.state))
        self.assertEqual(party.state.members[0], user.id)
        self.assertEqual(party.member_count, 1)
        self.assertEqual(cache.get('user-party:{}'.format(user.id)), party_id)

    @async_test
    async def test_party_join_does_not_exist(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error('Party does not exist'))

    @async_test
    async def test_party_join_state_does_not_exist(self):
        party = self.party
        communicator = self.communicator
        party_id = party.id

        party.state.delete()

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error('Party does not exist'))

    @async_test
    async def test_party_leave_and_deleted(self):
        user = self.user
        party = self.party
        communicator = self.communicator
        party_id = party.id

        await self.join()

        await communicator.send_json_to({
            'command': 'party.leave',
            'test': 'test',
        })
        await communicator.receive_nothing(1)

        self.assertIsNone(cache.get('user-party:{}'.format(user.id)))
        self.assertIsNone(cache.get('party:{}'.format(party_id)))
        self.assertFalse(Party.objects.filter(id=party_id).exists())

    @async_test
    async def test_party_leave_not_in_party(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.leave',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error(
            'You are currently not in the party'))

    @async_test
    async def test_party_leave_does_not_exist(self):
        party = self.party
        communicator = self.communicator

        await self.join()

        party.delete()

        await communicator.send_json_to({
            'command': 'party.leave',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error('Party does not exist'))

    @async_test
    async def test_party_leave_deleted_state(self):
        party = self.party
        communicator = self.communicator

        await self.join()

        party.state.delete()

        await communicator.send_json_to({
            'command': 'party.leave',
        })
        await communicator.receive_nothing(1)


class DoubleWebsocketTestCase(TestCaseWithCache):
    async def join_both(self):
        await self.communicator1.send_json_to({
            'command': 'party.join',
            'party_id': self.party.id,
        })
        await self.communicator1.receive_json_from(1)

        await self.communicator2.send_json_to({
            'command': 'party.join',
            'party_id': self.party.id,
        })
        await self.communicator2.receive_json_from(1)
        await self.communicator1.receive_json_from(1)

    @async_test
    async def setUp(self):
        super().setUp()

        user1 = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        user2 = User.objects.create_user(
            email='pbzweihander@rustacean.org',
            password='iluvrusttoo',
            username='pbzweihander',
        )
        party = Party(
            name="party 1 name",
            type=int(PartyType.Private),
            location="party 1 location",
            leader=user1,
        )
        party.save()
        self.client.login(email=user1.email, password='iluvrust')
        client2 = Client()
        client2.login(email=user2.email, password='iluvrusttoo')

        communicator1 = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator1.scope['user'] = user1
        communicator2 = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator2.scope['user'] = user2

        await communicator1.connect()
        await communicator2.connect()

        self.user1 = user1
        self.user2 = user2
        self.party = party
        self.communicator1 = communicator1
        self.communicator2 = communicator2

    @async_test
    async def tearDown(self):
        await self.communicator1.disconnect()
        await self.communicator2.disconnect()
        super().tearDown()

    @async_test
    async def test_party_join_and_broadcast(self):
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        party_id = party.id

        await communicator1.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        await communicator1.receive_json_from(1)

        await communicator2.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        await communicator2.receive_json_from(1)

        resp = await communicator1.receive_json_from(1)
        self.assertDictEqual(resp, event.party_join(user2.id))

    @async_test
    async def test_party_leave(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2

        await self.join_both()

        await communicator1.send_json_to({
            'command': 'party.leave',
        })

        resp = await communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.party_leave(user1.id))

        party.refresh_from_db()
        self.assertEqual(len(party.state.members), 1)
        self.assertEqual(party.state.members[0], user2.id)
        self.assertEqual(party.member_count, 1)
        self.assertIsNone(cache.get('user-party:{}'.format(user1.id)))

    @async_test
    async def test_menu_assign(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state = party.state

        await self.join_both()

        await communicator1.send_json_to({
            'command': 'menu.assign',
            'user_id': user1.id,
            'menu_id': 11,
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_assign(user1.id, 11))
        self.assertListEqual(state.menus, [(user1.id, 11)])

        await communicator2.send_json_to({
            'command': 'menu.assign',
            'user_id': user2.id,
            'menu_id': 22,
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_assign(user2.id, 22))
        self.assertListEqual(state.menus, [(user1.id, 11), (user2.id, 22)])

        await communicator2.send_json_to({
            'command': 'menu.assign',
            'user_id': user2.id,
            'menu_id': 22,
        })
        await communicator1.receive_nothing()
        await communicator2.receive_nothing()

    @async_test
    async def test_menu_unassign(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state = party.state
        state.menus = [(user1.id, 11), (user2.id, 22)]
        state.save()

        await self.join_both()

        await communicator1.send_json_to({
            'command': 'menu.unassign',
            'user_id': user1.id,
            'menu_id': 11,
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_unassign(user1.id, 11))
        self.assertListEqual(state.menus, [(user2.id, 22)])

        await communicator2.send_json_to({
            'command': 'menu.unassign',
            'user_id': user2.id,
            'menu_id': 22,
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_unassign(user2.id, 22))
        self.assertListEqual(state.menus, [])

        await communicator2.send_json_to({
            'command': 'menu.unassign',
            'user_id': user2.id,
            'menu_id': 22,
        })
        await communicator1.receive_nothing()
        await communicator2.receive_nothing()
