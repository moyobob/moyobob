from django.test import TestCase, Client
from django.core.cache import cache
from channels.testing import WebsocketCommunicator
import asyncio
import json

from backend.routings import application
from .consumer import WebsocketConsumer
from .models import MenuEntries
from api.models import User, Party, PartyType
from websocket import event


def new_communicator(user: User):
    communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
    communicator.scope['user'] = user
    return communicator


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
        await communicator.receive_json_from(1)

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

class TestCaseWithSingleWebsocket(TestCaseWithCache):
    async def join(self):
        await self.communicator.send_json_to({
            'command': 'party.join',
            'party_id': self.party.id,
        })
        await self.communicator.receive_json_from(1)


    @async_test
    async def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.party = Party(
            name="party 1 name",
            type=int(PartyType.Private),
            location="party 1 location",
            leader=self.user,
        )
        self.party.save()
        self.client.login(email=self.user.email, password='iluvrust')

        self.communicator = new_communicator(self.user)
        await self.communicator.connect()
        await self.communicator.receive_json_from(1)

    @async_test
    async def tearDown(self):
        await self.communicator.disconnect()
        super().tearDown()


class TestCaseWithDoubleWebsocket(TestCaseWithCache):
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

        self.user1 = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.user2 = User.objects.create_user(
            email='pbzweihander@rustacean.org',
            password='iluvrusttoo',
            username='pbzweihander',
        )
        self.party = Party(
            name="party 1 name",
            type=int(PartyType.Private),
            location="party 1 location",
            leader=self.user1,
        )
        self.party.save()
        self.client.login(email=self.user1.email, password='iluvrust')
        client2 = Client()
        client2.login(email=self.user2.email, password='iluvrusttoo')

        self.communicator1 = new_communicator(self.user1)
        self.communicator2 = new_communicator(self.user2)

        await self.communicator1.connect()
        await self.communicator2.connect()
        await self.communicator1.receive_json_from(1)
        await self.communicator2.receive_json_from(1)

    @async_test
    async def tearDown(self):
        await self.communicator1.disconnect()
        await self.communicator2.disconnect()
        super().tearDown()

class ConsumerTestCase(TestCaseWithSingleWebsocket):
    @async_test
    async def test_invalid_command(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'foo',
            'data': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_command())

    @async_test
    async def test_invalid_data(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.join',
            'foo': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_data())


class PartyTestCase1(TestCaseWithSingleWebsocket):
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
        self.assertEqual(party.state.member_ids[0], user.id)
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
        self.assertDictEqual(resp, event.error.invalid_party())

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
        self.assertDictEqual(resp, event.error.invalid_party())

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
        self.assertDictEqual(resp, event.error.not_joined())

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
        self.assertDictEqual(resp, event.error.invalid_party())

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

    @async_test
    async def test_already_joined(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'party.join',
            'party_id': self.party.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.already_joined())

    @async_test
    async def test_already_joined_connection(self):
        await self.join()

        await self.communicator.disconnect()

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = self.user

        await communicator.connect()
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.state_update(self.party.state))


class PartyTestCase2(TestCaseWithDoubleWebsocket):
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

        await communicator2.send_json_to({
            'command': 'party.leave',
        })

        resp = await communicator1.receive_json_from(1)
        self.assertDictEqual(resp, event.party_leave(user2.id))

        party.refresh_from_db()
        self.assertEqual(len(party.state.member_ids), 1)
        self.assertEqual(party.state.member_ids[0], user1.id)
        self.assertEqual(party.member_count, 1)
        self.assertIsNone(cache.get('user-party:{}'.format(user2.id)))

    @async_test
    async def test_change_leader_on_leaving(self):
        await self.join_both()

        await self.communicator1.send_json_to({
            'command': 'party.leave'
        })
        await self.communicator2.receive_json_from(1)

        self.party.refresh_from_db()
        self.assertEqual(self.party.leader, self.user2)

    @async_test
    async def test_already_joined_connection_receive_broadcast(self):
        await self.join_both()

        await self.communicator1.disconnect()

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = self.user1

        await communicator.connect()
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.state_update(self.party.state))

        await self.communicator2.send_json_to({
            'command': 'party.leave',
        })

        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.party_leave(self.user2.id))


class MenuTestCase(TestCaseWithDoubleWebsocket):
    @async_test
    async def test_menu_create(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state = party.state

        await self.join_both()

        await communicator1.send_json_to({
            'command': 'menu.create',
            'menu_id': 11,
            'quantity': 1,
            'user_ids': [user1.id],
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        id1 = resp['menu_entry_id']
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_create(id1, 11, 1, [user1.id]))
        self.assertTupleEqual(state.menu_entries.get(id1), (11, 1, [user1.id]))

        await communicator2.send_json_to({
            'command': 'menu.create',
            'menu_id': 11,
            'quantity': 1,
            'user_ids': [user2.id],
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        id2 = resp['menu_entry_id']
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_create(id2, 11, 1, [user2.id]))
        self.assertTupleEqual(state.menu_entries.get(id2), (11, 1, [user2.id]))
        self.assertDictEqual(state.menu_entries.inner, {
            id1: (11, 1, [user1.id]),
            id2: (11, 1, [user2.id]),
        })

    @async_test
    async def test_menu_update(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state = party.state
        state.menu_entries.inner = {1: (11, 1, [user1.id])}
        state.save()

        await self.join_both()

        await communicator2.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 1,
            'quantity': 1,
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_update(1, 1, [], []))
        self.assertTupleEqual(state.menu_entries.get(1), (11, 2, [user1.id]))

        await communicator1.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 1,
            'quantity': 1,
            'add_user_ids': [user2.id],
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_update(1, 1, [user2.id], []))
        self.assertTupleEqual(
            state.menu_entries.get(1), (11, 3, [user1.id, user2.id]))

        await communicator2.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 1,
            'quantity': -2,
            'remove_user_ids': [user1.id],
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_update(1, -2, [], [user1.id]))
        self.assertTupleEqual(state.menu_entries.get(1), (11, 1, [user2.id]))

        await communicator2.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 2,
            'quantity': 1,
        })
        await communicator1.receive_nothing()
        resp = await communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_menu_entry())

    @async_test
    async def test_menu_delete(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state = party.state
        state.menu_entries.inner = {
            1: (11, 1, [user1.id]), 2: (22, 2, [user2.id])}
        state.save()

        await self.join_both()

        await communicator2.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 1,
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_delete(1))
        self.assertIsNone(state.menu_entries.get(1))
        self.assertDictEqual(state.menu_entries.inner,
                             {2: (22, 2, [user2.id])})

        await communicator1.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 2,
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_delete(2))
        self.assertIsNone(state.menu_entries.get(2))
        self.assertDictEqual(state.menu_entries.inner, {})

        await communicator2.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 3,
        })
        await communicator1.receive_nothing()
        resp = await communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_menu_entry())


class MenuEntriesTestCase(TestCase):
    def setUp(self):
        self.entries = MenuEntries()

    def test_add(self):
        self.entries.add(1, 1, [1])
        self.assertDictEqual(self.entries.inner, {1: (1, 1, [1])})
        self.entries.add(2, 2, [2])
        self.assertDictEqual(self.entries.inner, {
                             1: (1, 1, [1]), 2: (2, 2, [2])})

    def test_delete(self):
        self.entries.inner = {1: (1, 1, [1]), 2: (2, 2, [2])}

        self.entries.delete(1)
        self.assertDictEqual(self.entries.inner, {2: (2, 2, [2])})
        self.entries.delete(2)
        self.assertDictEqual(self.entries.inner, {})
        with self.assertRaises(KeyError):
            self.entries.delete(3)

    def test_get(self):
        self.entries.inner = {1: (1, 1, [1]), 2: (2, 2, [2])}

        self.assertTupleEqual(self.entries.get(1), (1, 1, [1]))
        self.assertTupleEqual(self.entries.get(2), (2, 2, [2]))
        self.assertIsNone(self.entries.get(3))

    def test_update(self):
        self.entries.inner = {1: (1, 1, [1])}

        self.entries.update(1, 1)
        self.assertDictEqual(self.entries.inner, {1: (1, 2, [1])})
        self.entries.update(1, 1, add_user_ids=[2])
        self.assertDictEqual(self.entries.inner, {1: (1, 3, [1, 2])})
        self.entries.update(1, -2, remove_user_ids=[1])
        self.assertDictEqual(self.entries.inner, {1: (1, 1, [2])})
        with self.assertRaises(KeyError):
            self.entries.update(2, 1)

    def test_getitem(self):
        self.entries.inner = {1: (1, 1, [1]), 2: (2, 2, [2])}

        self.assertTupleEqual(self.entries[1], (1, 1, [1]))
        self.assertTupleEqual(self.entries[2], (2, 2, [2]))
        with self.assertRaises(KeyError):
            self.entries[3]
