from django.db import transaction

from . import TestCaseWithHttp
from api.models import User


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
        resp_json = resp.json()
        self.assertEqual(resp_json['username'], 'ferris')
        self.assertEqual(resp_json['email'], 'ferris@rustacean.org')

        resp = self.get('/api/signout/')
        self.assertEqual(resp.status_code, 200)

        resp = self.post('/api/signin/', {
            'email': 'ferris@rustacean.org',
            'password': 'ihaterust',
        })
        self.assertEqual(resp.status_code, 403)

        resp = self.get('/api/signout/')
        self.assertEqual(resp.status_code, 403)

    def test_sign_up_unique(self):
        with transaction.atomic():
            resp = self.post('/api/signup/', {
                'username': 'ferris',
                'password': 'iluvrust',
                'email': 'ferris@rustacean.org',
            })
            self.assertEqual(resp.status_code, 200)

        with transaction.atomic():
            resp = self.post('/api/signup/', {
                'username': 'ferris2',
                'password': 'iluvrusttoo',
                'email': 'ferris@rustacean.org',
            })
            self.assertEqual(resp.status_code, 400)

        with transaction.atomic():
            resp = self.post('/api/signup/', {
                'username': 'ferris',
                'password': 'iluvrusttoo',
                'email': 'ferris2@rustacean.org',
            })
            self.assertEqual(resp.status_code, 400)

    def test_verify_session(self):
        user = User.objects.create_user(
            username='ferris', email='ferris@rustacean.org', password='iluvrust')
        self.login("ferris@rustacean.org", "iluvrust")

        resp = self.get('/api/verify_session/')
        self.assertEqual(resp.status_code, 200)
        resp_json = resp.json()
        self.assertDictEqual(resp_json, {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        })

        self.logout()

        resp = self.get('/api/verify_session/')
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

        self.assertEqual(
            self.post('/api/verify_session/', {}).status_code, 405)
        self.assertEqual(self.put('/api/verify_session/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/verify_session/').status_code, 405)

    def test_bad_request(self):
        self.assertEqual(self.post('/api/signup/', {}).status_code, 400)
        self.assertEqual(self.post('/api/signin/', {}).status_code, 400)
