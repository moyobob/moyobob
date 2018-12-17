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
            'menu_ids': list(self.menus.values_list('id', flat=True).all()),
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
            'leader_id': self.leader_id,
            'since': str(self.since),
            'member_count': self.member_count,
            'restaurant_id': self.restaurant_id,
        }

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.get_state() is None:
            PartyState(self.id).save()

    def get_state(self):
        return PartyState.get(self.id)


class PartyRecord(models.Model):
    name = models.CharField(max_length=120)
    type = models.SmallIntegerField(choices=enum_to_choice(PartyType))
    location = models.CharField(max_length=120)
    leader = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='record_leader_set')
    since = models.DateTimeField()
    until = models.DateTimeField(auto_now=True)
    members = models.ManyToManyField(User, related_name='party_records')
    restaurant = models.ForeignKey(
        Restaurant, null=True, on_delete=models.SET_NULL)
    paid_user = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'leader_id': self.leader_id,
            'since': str(self.since),
            'until': str(self.until),
            'member_ids': list(self.members.values_list('id', flat=True).all()),
            'restaurant_id': self.restaurant_id,
            'paid_user_id': self.paid_user_id,
            'payment_ids': list(self.payments.values_list('id', flat=True).all()),
        }


class Payment(models.Model):
    user = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, related_name='payments')
    paid_user = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, related_name='collections')
    menu = models.ForeignKey(Menu, null=True, on_delete=models.SET_NULL)
    price = models.IntegerField(default=0)
    resolved = models.BooleanField(default=False)
    party_record = models.ForeignKey(
        PartyRecord, on_delete=models.CASCADE, related_name='payments')

    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'paid_user_id': self.paid_user_id,
            'menu_id': self.menu_id,
            'price': self.price,
            'resolved': self.resolved,
            'party_record_id': self.party_record_id,
        }
