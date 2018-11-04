from django.db import models
from django.forms.models import model_to_dict
from django.contrib.auth.models import User
from django.core.cache import cache
from enum import IntEnum

from websocket.models import PartyState


def enum_to_choice(enum: IntEnum):
    return [(tag, tag.value) for tag in enum]


class PartyType(IntEnum):
    InGroup = 0
    Private = 1


class Party(models.Model):
    name = models.CharField(max_length=120)
    type = models.SmallIntegerField(choices=enum_to_choice(PartyType))
    location = models.CharField(max_length=120)
    leader = models.ForeignKey(User, on_delete=models.CASCADE)
    since = models.DateTimeField(auto_now=True)
    member_count = models.IntegerField(default=0)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'leader_id': self.leader.id,
            'since': str(self.since),
            'member_count': self.member_count,
        }

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        state = PartyState(self.id)
        state.save()

    def delete(self, *args, **kwargs):
        state = PartyState.get(self.id)
        state.delete()
        super().delete(*args, **kwargs)

    @property
    def state(self):
        return PartyState.get(self.id)
