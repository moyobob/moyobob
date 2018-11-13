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
        if j is None:
            return None

        o = cls(j['id'])
        o.__dict__ = j
        return o

    def save(self):
        cache.set(self.key(self.id), self.as_dict())

    def delete(self):
        cache.delete(self.key(self.id))

    def refresh_from_db(self):
        self.__dict__ = self.get(self.id).as_dict()


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
        self.menus = []

    def as_dict(self):
        return {
            'id': self.id,
            'phase': self.phase,
            'restaurant': self.restaurant,
            'members': self.members,
            'menus': self.menus
        }
