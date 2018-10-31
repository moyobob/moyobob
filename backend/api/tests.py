from django.test import TestCase, Client
from django.contrib.auth.models import User
import json


class TestCaseWithHttp(TestCase):
    def get(self, url):
        client = Client(enforce_csrf_checks=True)
        return client.get(url)

    def post(self, url, obj):
        client = Client(enforce_csrf_checks=True)
        return client.post(url, json.dumps(obj), content_type='application/json')

    def put(self, url, obj):
        client = Client(enforce_csrf_checks=True)
        return client.put(url, json.dumps(obj), content_type='application/json')

    def delete(self, url):
        client = Client(enforce_csrf_checks=True)
        return client.delete(url)


class UserTestCase(TestCaseWithHttp):
    def test_sign_up_in_and_out(self):
        resp = self.post('/api/signup/',
                         {'username': 'rustacean', 'password': 'iluvrust'})
        self.assertEqual(resp.status_code, 201)

        resp = self.post('/api/signin/',
                         {'username': 'rustacean', 'password': 'iluvrust'})
        self.assertEqual(resp.status_code, 204)

        resp = self.get('/api/signout/')
        self.assertEqual(resp.status_code, 204)

        resp = self.post('/api/signin/',
                         {'username': 'rustacean', 'password': 'ihaterust'})
        self.assertEqual(resp.status_code, 401)

        resp = self.get('/api/signout/')
        self.assertEqual(resp.status_code, 401)

    def test_invalid_method(self):
        self.assertEqual(self.get('/api/signup/').status_code, 405)
        self.assertEqual(self.put('/api/signup/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/signup/').status_code, 405)

        self.assertEqual(self.get('/api/signin/').status_code, 405)
        self.assertEqual(self.put('/api/signin/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/signin/').status_code, 405)

        self.assertEqual(self.post('/api/signout/', {}).status_code, 405)
        self.assertEqual(self.put('/api/signout/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/signout/').status_code, 405)
