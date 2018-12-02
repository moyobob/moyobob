from . import TestCaseWithHttp
from api.models import User, Restaurant


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
