from django.core.cache import cache
from enum import IntEnum
import json


class CacheModel():
    _key = 'key'

    @classmethod
    def key(cls, id):
        return '{}:{}'.format(cls._key, id)

    @classmethod
    def get(cls, id: int):
        j = cache.get(cls.key(id))

        o = cls(j['id'])
        o.__dict__ = json.loads(j)
        return o

    def save(self):
        cache.set(type(self).key(self.id), json.dumps(self.as_dict()))

    def delete(self):
        cache.delete(type(self).key(self.id))


class PartyPhase(IntEnum):
    ChoosingRestaurant = 0
    ChoosingMenu = 1
    Ordering = 2
    Ordered = 3
    PaymentAndCollection = 4


class PartyState(CacheModel):
    _key = 'party'

    def __init__(self, party_id: int):
        self.id = party_id
        self.phase = PartyPhase.ChoosingRestaurant
        self.restaurant = None
        self.members = []
        self.menus = {}

    def as_dict(self):
        return {
            'id': self.id,
            'phase': self.phase,
            'restaurant': self.restaurant,
            'self.members': self.members,
            'self.menus': self.menus
        }
