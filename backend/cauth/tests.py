from django.test import TestCase

from .models import User


class CustomAuthTestCase(TestCase):
    def test_invalid_user(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(None, None, None)
        with self.assertRaises(ValueError):
            User.objects.create_user("foo@bar.com", None, None)

    def test_superuser(self):
        User.objects.create_superuser(
            "ferris@rustaceans.org", "ferris", "iluvrust")

        user = User.objects.get(username="ferris")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
