from django.test import TestCase, Client
from django.contrib.auth.models import User
import json


class TestCaseWithHttp(TestCase):
    def setUp(self):
        self.client = Client()

    def get(self, url):
        return self.client.get(url)

    def post(self, url, obj):
        return self.client.post(url, json.dumps(obj), content_type='application/json')

    def put(self, url, obj):
        return self.client.put(url, json.dumps(obj), content_type='application/json')

    def delete(self, url):
        return self.client.delete(url)


class UserTestCase(TestCaseWithHttp):
    def test_sign_up_in_and_out(self):
        resp = self.post('/api/signup/', {
            'username': 'ferris',
            'password': 'iluvrust',
            'email': 'ferris@rustacean.org',
        })
        self.assertEqual(resp.status_code, 200)

        resp = self.post('/api/signin/', {
            'email': 'ferris@rustacean.org',
            'password': 'iluvrust',
        })
        self.assertEqual(resp.status_code, 200)

        resp = self.get('/api/signout/')
        self.assertEqual(resp.status_code, 200)

        resp = self.post('/api/signin/', {
            'email': 'ferris@rustacean.org',
            'password': 'ihaterust',
        })
        self.assertEqual(resp.status_code, 403)

        resp = self.get('/api/signout/')
        self.assertEqual(resp.status_code, 403)

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

    def test_bad_request(self):
        self.assertEqual(self.post('/api/signup/', {}).status_code, 400)
        self.assertEqual(self.post('/api/signin/', {}).status_code, 400)
