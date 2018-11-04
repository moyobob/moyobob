from django.test import TestCase, Client
from django.core.cache import cache
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
import asyncio
import json

from backend.routings import application
from .consumer import WebsocketConsumer


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

        resp = await communicator.receive_from()
        resp_json = json.loads(resp)
        self.assertEqual(resp_json['type'], 'success')
        self.assertEqual(resp_json['event'], 'connect')

        await communicator.disconnect()
