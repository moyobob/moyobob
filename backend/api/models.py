from django.db import models
from django.contrib.auth.models import User
from django.core.cache import cache
from enum import IntEnum


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
    members = models.ManyToManyField(User, related_name='parties')
    since = models.DateTimeField(auto_now=True)

    def member_count(self):
        state = cache.get('party:{}'.format(self.id))
        return len(state['members'])
