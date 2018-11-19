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
        return cache.get(cls.key(id))

    def save(self):
        cache.set(self.key(self.id), self.as_dict())

    def delete(self):
        cache.delete(self.key(self.id))

    def refresh_from_db(self):
        pass


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
        # TODO: Change to ChoosingRestaurant
        self.phase = PartyPhase.ChoosingMenu
        self.restaurant = None
        self.members = []
        self.menus = MenuEntries()

    @classmethod
    def get(cls, id: int):
        o = super().get(id)
        if o is None:
            return None

        self = PartyState(o['id'])
        self.refresh_from_db()

        return self

    def refresh_from_db(self):
        super().refresh_from_db()
        o = super().get(self.id)
        self.phase = o['phase']
        self.restaurant = o.get('restaurant', None)
        self.members = o['members']
        self.menus = MenuEntries.from_dict(o['menus'])

    def as_dict(self):
        return {
            'id': self.id,
            'phase': self.phase,
            'restaurant': self.restaurant,
            'members': self.members,
            'menus': self.menus.as_dict() if isinstance(self.menus, MenuEntries) else self.menus,
        }


class MenuEntries:
    last_id = 0
    inner = {}

    def __init__(self):
        self.last_id = 0
        self.inner = {}

    @classmethod
    def from_dict(cls, d: dict):
        o = cls()
        if d is not None and len(d) > 0:
            o.inner = d
            o.last_id = max(d.keys())
        return o

    def as_dict(self):
        return self.inner

    def add(self, menu_id: int, quantity: int, users: list):
        id = self.last_id + 1
        self.inner[id] = ((menu_id, quantity, users))
        self.last_id = id
        return id

    def delete(self, menu_entry_id: int):
        return self.inner.pop(menu_entry_id)

    def get(self, menu_entry_id: int, default=None):
        return self.inner.get(menu_entry_id, default)

    def update(self, menu_entry_id: int, quantity: int, add_users=[], remove_users=[]):
        (m, q, ul) = self.inner[menu_entry_id]
        q += quantity
        ul.extend(add_users)
        for u in remove_users:
            ul.remove(u)
        self.inner[menu_entry_id] = (m, q, ul)
        return self.inner[menu_entry_id]

    def __getitem__(self, key):
        return self.inner[key]
