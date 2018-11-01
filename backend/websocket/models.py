from enum import Enum


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
