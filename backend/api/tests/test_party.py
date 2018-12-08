from django.core.cache import cache

from . import TestCaseWithHttp
from api.models import User, Party, PartyType, Restaurant


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
        self.assertListEqual(
            resp_json, [self.party1.as_dict(), self.party2.as_dict()])

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

    def test_delete_party_with_invalid_state(self):
        party = Party(
            name="new party name",
            type=int(PartyType.Private),
            location="new party location",
            leader=self.user,
        )
        party.save()
        id = party.id

        self.login()

        party.state.delete()
        resp = self.delete('/api/party/{}/'.format(id))
        self.assertEqual(resp.status_code, 200)

    def test_get_party_detail(self):
        self.login()

        resp = self.get('/api/party/{}/'.format(self.party1.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertDictEqual(resp_json, self.party1.as_dict())

    def test_party_restaurant_field(self):
        self.assertEqual(self.party1.as_dict()['restaurant_id'], 0)

        restaurant = Restaurant(name="Rustaurant")
        restaurant.save()
        self.party1.restaurant = restaurant
        self.party1.save()

        self.assertEqual(self.party1.as_dict()['restaurant_id'], restaurant.id)
