from django.test import TestCase, Client
from django.core.cache import cache
from django.db import transaction
import json


class TestCaseWithCache(TestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        from django_redis import get_redis_connection
        get_redis_connection('default').flushdb()


class TestCaseWithHttp(TestCaseWithCache):
    def setUp(self):
        super().setUp()

    def get(self, url):
        return self.client.get(url)

    def post(self, url, obj):
        return self.client.post(url, json.dumps(obj), content_type='application/json')

    def put(self, url, obj):
        return self.client.put(url, json.dumps(obj), content_type='application/json')

    def delete(self, url):
        return self.client.delete(url)

    def login(self, email, password):
        self.client.login(email=email, password=password)

    def logout(self):
        self.client.logout()
