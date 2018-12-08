from django.test import Client

from . import TestCaseWithHttp
from api.models import User, Party, PartyType, Restaurant, Menu, PartyRecord, Payment
from websocket.models import PartyState, PartyPhase


class RecordTestCase(TestCaseWithHttp):
    def login(self):
        super().login(email="ferris@rustaceans.org", password="iluvrust")

    def setUp(self):
        self.user1 = User.objects.create_user(
            email="ferris@rustaceans.org", username="ferris", password="iluvrust",
        )
        self.user2 = User.objects.create_user(
            email="pbzweihander@rustaceans.org", username="pbzweihadner", password="iluvrust2",
        )
        self.user3 = User.objects.create_user(
            email="thomas@pbzweihander.me", username="thomas", password="iamadmin",
        )

        self.party = Party(
            name="rust party", location="rustland", type=int(PartyType.InGroup), leader=self.user1)
        self.party.save()
        self.state = self.party.get_state()

        self.restaurant = Restaurant(name="Rustaurant")
        self.restaurant.save()

        self.menu1 = Menu(name="Trait", price=10000)
        self.menu1.save()
        self.menu2 = Menu(name="Struct", price=33000)
        self.menu2.save()
        self.menu3 = Menu(name="Macro", price=13130)
        self.menu3.save()

        self.state.member_ids = [self.user1.id, self.user2.id, self.user3.id]
        self.state.menu_entries.add(
            self.menu1.id, 3, [self.user1.id, self.user2.id, self.user3.id])
        self.state.menu_entries.add(
            self.menu2.id, 1, [self.user1.id, self.user2.id, self.user3.id])
        self.state.menu_entries.add(
            self.menu3.id, 6, [self.user1.id, self.user2.id, self.user3.id])
        self.state.phase = PartyPhase.PaymentAndCollection
        self.state.paid_user_id = self.user2.id
        self.state.restaurant_id = self.restaurant.id
        self.state.save()
        self.party.restaurant_id = self.restaurant.id
        self.party.save()

    def test_create_record(self):
        state = self.state
        state.delete()

        self.assertTrue(PartyRecord.objects.all().exists())

        record = PartyRecord.objects.all()[0]

        self.assertEqual(record.name, self.party.name)
        self.assertEqual(record.type, self.party.type)
        self.assertEqual(record.location, self.party.location)
        self.assertEqual(record.leader, self.party.leader)
        self.assertEqual(record.since, self.party.since)
        self.assertListEqual(
            [member.id for member in record.members.all()], [self.user1.id, self.user2.id, self.user3.id])
        self.assertEqual(record.restaurant, self.party.restaurant)
        self.assertEqual(record.paid_user_id, state.paid_user_id)

        payments = record.payments.all()

        for payment in payments:
            self.assertTrue(payment.user.id in [self.user1.id, self.user3.id])
            self.assertEqual(payment.paid_user.id, self.user2.id)
            if payment.menu.id == self.menu1.id:
                self.assertEqual(payment.price, self.menu1.price)
            elif payment.menu.id == self.menu2.id:
                self.assertEqual(payment.price, self.menu2.price / 3)
            else:
                self.assertEqual(payment.price, self.menu3.price * 2)

    def test_not_allowed(self):
        self.assertEqual(self.post('/api/party_records/', {}).status_code, 405)
        self.assertEqual(self.put('/api/party_records/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/party_records/').status_code, 405)

        self.assertEqual(self.post('/api/payments/', {}).status_code, 405)
        self.assertEqual(self.put('/api/payments/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/payments/').status_code, 405)

        self.assertEqual(self.post('/api/collections/', {}).status_code, 405)
        self.assertEqual(self.put('/api/collections/', {}).status_code, 405)
        self.assertEqual(self.delete('/api/collections/').status_code, 405)

    def test_unauthenticated(self):
        self.assertEqual(self.get('/api/party_records/').status_code, 403)
        self.assertEqual(self.get('/api/payments/').status_code, 403)
        self.assertEqual(self.get('/api/collections/').status_code, 403)

    def test_get_records(self):
        self.state.delete()
        record = PartyRecord.objects.all()[0]

        self.login()

        resp = self.get('/api/party_records/')
        self.assertEqual(resp.status_code, 200)
        resp_json = resp.json()
        self.assertEqual(resp_json[0]['id'], record.id)

    def test_get_payments(self):
        self.state.delete()
        record = PartyRecord.objects.all()[0]

        self.login()

        resp = self.get('/api/payments/')
        self.assertEqual(resp.status_code, 200)
        resp_json = resp.json()
        self.assertEqual(
            [payment['id'] for payment in resp_json],
            [payment.id for payment in record.payments.filter(
                user_id=self.user1.id).all()],
        )

    def test_get_collections(self):
        self.state.delete()
        record = PartyRecord.objects.all()[0]

        self.login()

        resp = self.get('/api/collections/')
        self.assertEqual(resp.status_code, 200)
        resp_json = resp.json()
        self.assertEqual(
            [payment['id'] for payment in resp_json],
            [payment.id for payment in record.payments.filter(
                paid_user_id=self.user1.id).all()],
        )

    def test_resolve_payment(self):
        self.state.delete()
        record = PartyRecord.objects.all()[0]

        super().login(email="pbzweihander@rustaceans.org", password="iluvrust2")

        resp = self.get('/api/resolve_payment/0/')
        self.assertEqual(resp.status_code, 404)

        for payment in record.payments.all():
            resp = self.get('/api/resolve_payment/{}/'.format(payment.id))
            self.assertEqual(resp.status_code, 200)

        self.assertFalse(Payment.objects.filter(resolved=False).exists())

        resp = self.get('/api/collections/')
        self.assertListEqual(resp.json(), [])

        client = Client()
        client.login(email="ferris@rustaceans.org", password="iluvrust")
        resp = client.get('/api/payments/')
        self.assertListEqual(resp.json(), [])

        resp = client.get(
            '/api/resolve_payment/{}/'.format(record.payments.all()[0].id))
        self.assertEqual(resp.status_code, 403)
