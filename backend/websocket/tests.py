from django.test import TestCase
from django.core.cache import cache
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator

from backend.routings import application


class TestCaseWithCache(TestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        from django_redis import get_redis_connection
        get_redis_connection('default').flushdb()


class WebsocketTestCase(TestCaseWithCache):
    def setUp(self):
        super().setUp()
        User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.communicator = WebsocketCommunicator(application, '/ws/party/')

    def test_unauthenticated(self):
        raise Exception("foo")
