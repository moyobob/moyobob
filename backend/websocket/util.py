from django.core.cache import cache

from api.models import Party
from . import exception


def get_party(party_id: int):
    try:
        party = Party.objects.get(id=party_id)
    except Party.DoesNotExist:
        raise exception.InvalidPartyError
    state = party.state

    if state is None:
        party.delete()
        raise exception.InvalidPartyError

    return (party, state)


def get_party_of_user(user_id: int):
    party_id = cache.get('user-party:{}'.format(user_id))

    if party_id is None:
        raise exception.NotJoinedError

    try:
        (party, state) = get_party(party_id)
    except exception.InvalidPartyError:
        cache.delete('user-party:{}'.format(user_id))
        raise

    return (party, state)
