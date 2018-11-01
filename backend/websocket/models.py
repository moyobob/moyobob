from django.core.cache import cache
from enum import Enum
import json


class PartyPhase(Enum):
    ChoosingRestaurant = 0
    ChoosingMenu = 1
    Ordering = 2
    Ordered = 3
    PaymentAndCollection = 4


class PartyState:
    def __init__(self, party_id: int):
        self.key = 'party:{}'.format(party_id)
        self.phase = PartyPhase.ChoosingRestaurant
        self.restaurant = None
        self.members = []
        self.menus = {}

    def save(self):
        cache.set(self.key, json.dumps(self))

    @classmethod
    def get(party_id: int):
        return cache.get('party:{}'.format(party_id))
