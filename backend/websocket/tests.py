from django.test import TestCase, Client
from django.core.cache import cache
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
import asyncio
import json

from backend.routings import application
from .consumer import WebsocketConsumer
from api.models import Party, PartyType


def async_test(f):
    def wrapper(*args, **kwargs):
        coro = asyncio.coroutine(f)
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


class WebsocketTestCase(TestCaseWithCache):
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

        resp = await communicator.receive_json_from()
        self.assertEqual(resp['type'], 'success')
        self.assertEqual(resp['event'], 'connect')

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
        await communicator.receive_from()

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

    @async_test
    async def test_invalid_command(self):
        user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.client.login(email=user.email, password='iluvrust')

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = user

        await communicator.connect()
        await communicator.receive_from()

        await communicator.send_json_to({
            'command': 'foo',
            'data': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertEqual(resp['type'], 'error')
        self.assertEqual(resp['error'], 'Invalid command')

        await communicator.disconnect()

    @async_test
    async def test_invalid_data(self):
        user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.client.login(email=user.email, password='iluvrust')

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = user

        await communicator.connect()
        await communicator.receive_from()

        await communicator.send_json_to({
            'command': 'party.join',
            'foo': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertEqual(resp['type'], 'error')
        self.assertEqual(resp['error'], 'Invalid data')

        await communicator.disconnect()

    @async_test
    async def test_party_join(self):
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
        await communicator.receive_from()

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': party.id,
        })
        resp = await communicator.receive_json_from(1)
        self.assertEqual(resp['type'], 'success')
        self.assertEqual(resp['event'], 'party.join')

        party.refresh_from_db()
        self.assertEqual(party.state.members[0], user.id)
        self.assertEqual(party.member_count, 1)
        self.assertEqual(cache.get('user-party:{}'.format(user.id)), party.id)

        await communicator.disconnect()

    @async_test
    async def test_party_does_not_exist(self):
        user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.client.login(email=user.email, password='iluvrust')

        communicator = WebsocketCommunicator(WebsocketConsumer, '/',)
        communicator.scope['user'] = user

        await communicator.connect()
        await communicator.receive_from()

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertEqual(resp['type'], 'error')
        self.assertEqual(resp['error'], 'Party does not exist')

        await communicator.disconnect()

    @async_test
    async def test_party_state_does_not_exist(self):
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
        await communicator.receive_from()

        party.state.delete()

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': party.id,
        })
        resp = await communicator.receive_json_from(1)
        self.assertEqual(resp['type'], 'error')
        self.assertEqual(resp['error'], 'Party does not exist')

        await communicator.disconnect()
