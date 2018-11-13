from django.test import TestCase, Client
from django.core.cache import cache
from django.db import transaction
import json

from .models import User, Party, PartyType, Restaurant, Menu


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


class PartyTestCase(TestCaseWithHttp):
    def setUp(self):
        super().setUp()

        self.user = User.objects.create_user(
            username='ferris', email='ferris@rustacean.org', password='iluvrust')

        self.party1 = Party(
            name="party 1 name",
            type=int(PartyType.Private),
            location="party 1 location",
            leader=self.user,
        )
        self.party1.save()

        self.party2 = Party(
            name="party 2 name",
            type=int(PartyType.InGroup),
            location="party 2 location",
            leader=self.user,
        )
        self.party2.save()

    def login(self):
        super().login(email='ferris@rustacean.org', password='iluvrust')

    def test_not_allowed(self):
        self.assertEqual(self.put('/api/party/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/party/').status_code, 405)

        self.assertEqual(self.post('/api/party/0/', {}).status_code, 405)
        self.assertEqual(self.put('/api/party/0/', {}).status_code, 405)

    def test_unauthenticated(self):
        self.assertEqual(self.get('/api/party/').status_code, 403)
        self.assertEqual(self.post('/api/party/', {}).status_code, 403)

        self.assertEqual(self.get('/api/party/0/').status_code, 403)
        self.assertEqual(self.delete('/api/party/0/').status_code, 403)

        self.login()
        self.assertEqual(self.get('/api/party/').status_code, 200)
        self.logout()
        self.assertEqual(self.get('/api/party/').status_code, 403)

    def test_not_found(self):
        self.login()
        self.assertEqual(self.get('/api/party/0/').status_code, 404)
        self.assertEqual(self.delete('/api/party/0/').status_code, 404)

    def test_get_party_state(self):
        state1 = self.party1.state
        self.assertIsNotNone(state1)
        state2 = self.party2.state
        self.assertIsNotNone(state2)

    def test_get_party(self):
        self.login()

        resp = self.get('/api/party/')
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(len(resp_json), 2)
        self.assertEqual(resp_json[0]['name'], self.party1.name)
        self.assertEqual(resp_json[0]['type'], self.party1.type)
        self.assertEqual(resp_json[0]['location'], self.party1.location)
        self.assertEqual(resp_json[0]['leader_id'], self.party1.leader.id)
        self.assertEqual(resp_json[1]['name'], self.party2.name)
        self.assertEqual(resp_json[1]['type'], self.party2.type)
        self.assertEqual(resp_json[1]['location'], self.party2.location)
        self.assertEqual(resp_json[1]['leader_id'], self.party2.leader.id)

    def test_post_party(self):
        self.login()

        new_party = {
            'name': 'new party name',
            'type': PartyType.Private,
            'location': 'new party location',
        }

        resp = self.post('/api/party/', new_party)
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(resp_json['name'], new_party['name'])
        self.assertEqual(resp_json['type'], new_party['type'])
        self.assertEqual(resp_json['location'], new_party['location'])
        self.assertEqual(resp_json['leader_id'], self.user.id)

        id = resp_json['id']
        party = Party.objects.get(id=id)
        self.assertEqual(party.name, new_party['name'])
        self.assertEqual(party.type, new_party['type'])
        self.assertEqual(party.location, new_party['location'])
        self.assertEqual(party.leader.id, self.user.id)

    def test_post_party_bad_request(self):
        self.login()

        resp = self.post('/api/party/', {})
        self.assertEqual(resp.status_code, 400)

    def test_delete_party(self):
        party = Party(
            name="new party name",
            type=int(PartyType.Private),
            location="new party location",
            leader=self.user,
        )
        party.save()
        id = party.id

        self.assertIsNotNone(cache.get('party:{}'.format(id)))
        state = party.state
        self.assertIsNotNone(state)

        self.login()

        resp = self.delete('/api/party/{}/'.format(id))
        self.assertEqual(resp.status_code, 200)

        party = Party.objects.filter(id=id)
        self.assertTrue(not party.exists())
        self.assertIsNone(cache.get('party:{}'.format(id)))

        user = User.objects.create_user(
            username="user", email="user@example.com", password="somepass")
        user.save()
        party = Party(name="party", type=int(PartyType.InGroup),
                      location="somewhere", leader=user)
        party.save()

        resp = self.delete('/api/party/{}/'.format(party.id))
        self.assertEqual(resp.status_code, 403)

        state = party.state
        state.delete()
        party.delete()

    def test_get_party_detail(self):
        self.login()

        resp = self.get('/api/party/{}/'.format(self.party1.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertDictEqual(resp_json, self.party1.as_dict())


class RestaurantTestCase(TestCaseWithHttp):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            username='ferris', email='ferris@rustacean.org', password='iluvrust')

        self.restaurant = Restaurant(name="Rustaurant")
        self.restaurant.save()

    def login(self):
        super().login(email='ferris@rustacean.org', password='iluvrust')

    def test_not_allowed(self):
        self.assertEqual(self.post('/api/restaurant/0/', {}).status_code, 405)
        self.assertEqual(self.put('/api/restaurant/0/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/restaurant/0/').status_code, 405)

    def test_unauthenticated(self):
        self.assertEqual(self.get('/api/restaurant/0/').status_code, 403)

    def test_not_found(self):
        self.login()
        self.assertEqual(self.get('/api/restaurant/0/').status_code, 404)

    def test_get_restaurant_detail(self):
        self.login()

        resp = self.get('/api/restaurant/{}/'.format(self.restaurant.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertDictEqual(resp_json, self.restaurant.as_dict())


class MenuTestCase(TestCaseWithHttp):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            username='ferris', email='ferris@rustacean.org', password='iluvrust')

        self.restaurant = Restaurant(name="Rustaurant")
        self.restaurant.save()
        self.menu = Menu(name="Crab", price=6697)
        self.menu.save()

        self.restaurant.menus.add(self.menu)

    def login(self):
        super().login(email='ferris@rustacean.org', password='iluvrust')

    def test_not_allowed(self):
        self.assertEqual(
            self.post('/api/restaurant/0/menu/', {}).status_code, 405)
        self.assertEqual(
            self.put('/api/restaurant/0/menu/', {}).status_code, 405)
        self.assertEqual(self.delete(
            '/api/restaurant/0/menu/').status_code, 405)

        self.assertEqual(self.post('/api/menu/0/', {}).status_code, 405)
        self.assertEqual(self.put('/api/menu/0/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/menu/0/').status_code, 405)

    def test_unauthenticated(self):
        self.assertEqual(self.get('/api/restaurant/0/menu/').status_code, 403)
        self.assertEqual(self.get('/api/menu/0/').status_code, 403)

    def test_not_found(self):
        self.login()
        self.assertEqual(self.get('/api/restaurant/0/menu/').status_code, 404)
        self.assertEqual(self.get('/api/menu/0/').status_code, 404)

    def test_get_menu(self):
        self.login()

        resp = self.get('/api/restaurant/{}/menu/'.format(self.restaurant.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertListEqual(resp_json, [self.menu.as_dict()])

    def test_get_menu_detail(self):
        self.login()

        resp = self.get('/api/menu/{}/'.format(self.menu.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertDictEqual(resp_json, self.menu.as_dict())
