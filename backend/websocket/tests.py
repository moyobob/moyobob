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
