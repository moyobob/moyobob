from django.db import models
from django.contrib.auth.models import User
from enum import Enum


def enum_to_choice(enum: Enum):
    return [(tag, tag.value) for tag in enum]


class PartyType(Enum):
    PublicParty = 0
    GroupOpenedParty = 1
    ClosedParty = 2


class Party(models.Model):
    name = models.CharField(max_length=120)
    state = models.IntegerField()
    type = models.SmallIntegerField(choices=enum_to_choice(PartyType))
    location = models.CharField(max_length=120)
    leader = models.ForeignKey(User, on_delete=models.CASCADE)
    since = models.DateTimeField(auto_now=True)
