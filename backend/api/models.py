from django.db import models
from django.core.cache import cache
from enum import IntEnum

from websocket.models import PartyState
from cauth.models import User


def enum_to_choice(enum: IntEnum):
    return [(tag.value, tag.value) for tag in enum]


class PartyType(IntEnum):
    InGroup = 0
    Private = 1


class Menu(models.Model):
    name = models.CharField(max_length=120)
    price = models.IntegerField(default=0)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
        }


class Restaurant(models.Model):
    name = models.CharField(max_length=120)
    menus = models.ManyToManyField(Menu)
    phone_number = models.CharField(max_length=20)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'menus': [menu.id for menu in self.menus.all()],
            'phone_number': self.phone_number,
        }


class Party(models.Model):
    name = models.CharField(max_length=120)
    type = models.SmallIntegerField(choices=enum_to_choice(PartyType))
    location = models.CharField(max_length=120)
    leader = models.ForeignKey(User, on_delete=models.CASCADE)
    since = models.DateTimeField(auto_now=True)
    member_count = models.IntegerField(default=0)
    restaurant = models.ForeignKey(
        Restaurant, blank=True, null=True, on_delete=models.SET_NULL)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'leader_id': self.leader.id,
            'since': str(self.since),
            'member_count': self.member_count,
            'restaurant_id': self.restaurant.id if self.restaurant is not None else 0,
        }

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.state is None:
            PartyState(self.id).save()

    def delete(self, *args, **kwargs):
        state = self.state
        if state is not None:
            state.delete()
        super().delete(*args, **kwargs)

    @property
    def state(self):
        return PartyState.get(self.id)


class Payment(models.Model):
    user = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, related_name="payments")
    paid_user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    menu = models.ForeignKey(Menu, null=True, on_delete=models.SET_NULL)
    price = models.IntegerField(default=0)
    resolved = models.BooleanField()

    def as_dict(self):
        return {
            'user_id': self.user.id,
            'paid_user_id': self.paid_user.id,
            'menu_id': self.menu.id,
            'price': self.price,
            'resolved': self.resolved,
            'party_id': self.party.id,
        }


class PartyRecord(models.Model):
    name = models.CharField(max_length=120)
    type = models.SmallIntegerField(choices=enum_to_choice(PartyType))
    location = models.CharField(max_length=120)
    leader = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="record_leader_set")
    since = models.DateTimeField()
    until = models.DateTimeField()
    members = models.ManyToManyField(User, related_name="party_records")
    restaurant = models.ForeignKey(
        Restaurant, null=True, on_delete=models.SET_NULL)
    paid_user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    payments = models.ManyToManyField(Payment, related_name="party")

    def as_dict(self):
        return {
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'leader_id': self.leader.id,
            'since': str(self.since),
            'until': str(self.until),
            'member_ids': [member.id for member in self.members.all()],
            'restaurant_id': self.restaurant.id,
            'paid_user_id': self.paid_user.id,
            'payment_ids': [payment.id for payment in self.payments.all()],
        }
