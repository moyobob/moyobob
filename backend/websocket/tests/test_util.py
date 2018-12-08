from django.core.cache import cache

from . import TestCaseWithCache
from api.models import Party, PartyType, User
from websocket.consumer import get_party_state, get_party, get_party_of_user, get_party_state_of_user
from websocket.exception import NotJoinedError, InvalidPartyError


class UtilTestCase(TestCaseWithCache):
    def setUp(self):
        super().setUp()

        self.user = User.objects.create_user(
            email='ferris@rustacean.org',
            password='iluvrust',
            username='ferris',
        )
        self.party = Party(
            name="party 1 name",
            type=int(PartyType.Private),
            location="party 1 location",
            leader=self.user,
        )
        self.party.save()
        self.state = self.party.get_state()

        cache.set('user-party:{}'.format(self.user.id), self.party.id)

        self.client.login(email=self.user.email, password='iluvrust')

    def test_get_party_state(self):
        state = get_party_state(self.party.id)

        self.assertEqual(state.as_dict(), self.state.as_dict())

    def test_get_party(self):
        (party, state) = get_party(self.state.id)

        self.assertEqual(party.as_dict(), self.party.as_dict())
        self.assertEqual(state.as_dict(), self.state.as_dict())

    def test_get_party_of_user(self):
        (party, state) = get_party_of_user(self.user.id)

        self.assertEqual(party.as_dict(), self.party.as_dict())
        self.assertEqual(state.as_dict(), self.state.as_dict())

    def test_get_party_state_of_user(self):
        state = get_party_state_of_user(self.user.id)

        self.assertEqual(state.as_dict(), self.state.as_dict())

    def test_get_party_state_invalid(self):
        with self.assertRaises(InvalidPartyError):
            get_party_state(0)

    def test_get_party_invalid(self):
        with self.assertRaises(InvalidPartyError):
            get_party(0)

    def test_get_party_of_user_not_joined(self):
        cache.delete('user-party:{}'.format(self.user.id))

        with self.assertRaises(NotJoinedError):
            get_party_of_user(self.user.id)

    def test_get_party_state_of_user_not_joined(self):
        cache.delete('user-party:{}'.format(self.user.id))

        with self.assertRaises(NotJoinedError):
            get_party_state_of_user(self.user.id)

    def test_get_party_of_user_invalid(self):
        cache.set('user-party:{}'.format(self.user.id), 0)

        with self.assertRaises(InvalidPartyError):
            get_party_of_user(self.user.id)

    def test_get_party_state_of_user_invalid(self):
        cache.set('user-party:{}'.format(self.user.id), 0)

        with self.assertRaises(InvalidPartyError):
            get_party_state_of_user(self.user.id)
