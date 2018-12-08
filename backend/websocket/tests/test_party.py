from django.core.cache import cache

from websocket import event
from . import async_test, new_communicator
from . import TestCaseWithSingleWebsocket, TestCaseWithDoubleWebsocket
from api.models import Party


class PartyTestCase1(TestCaseWithSingleWebsocket):
    @async_test
    async def test_party_join(self):
        user = self.user
        party = self.party
        state = self.state
        communicator = self.communicator
        party_id = party.id

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        resp = await communicator.receive_json_from(1)

        party.refresh_from_db()
        state.refresh_from_db()
        self.assertDictEqual(resp, event.state_update(state))
        self.assertEqual(state.member_ids[0], user.id)
        self.assertEqual(party.member_count, 1)
        self.assertEqual(cache.get('user-party:{}'.format(user.id)), party_id)

    @async_test
    async def test_party_join_does_not_exist(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_party())

    @async_test
    async def test_party_join_state_does_not_exist(self):
        party = self.party
        state = self.state
        communicator = self.communicator
        party_id = party.id

        state.delete()

        await communicator.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_party())

    @async_test
    async def test_party_leave_and_deleted(self):
        user = self.user
        party = self.party
        communicator = self.communicator
        party_id = party.id

        await self.join()

        await communicator.send_json_to({
            'command': 'party.leave',
            'test': 'test',
        })
        await communicator.receive_nothing(1)

        self.assertIsNone(cache.get('user-party:{}'.format(user.id)))
        self.assertIsNone(cache.get('party:{}'.format(party_id)))
        self.assertFalse(Party.objects.filter(id=party_id).exists())

    @async_test
    async def test_party_leave_not_in_party(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.leave',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.not_joined())

    @async_test
    async def test_party_leave_does_not_exist(self):
        party = self.party
        communicator = self.communicator

        await self.join()

        party.delete()

        await communicator.send_json_to({
            'command': 'party.leave',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_party())

    @async_test
    async def test_party_leave_deleted_state(self):
        state = self.state
        communicator = self.communicator

        await self.join()

        state.delete()

        await communicator.send_json_to({
            'command': 'party.leave',
        })
        await communicator.receive_nothing(1)

    @async_test
    async def test_already_joined(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'party.join',
            'party_id': self.party.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.already_joined())

    @async_test
    async def test_already_joined_connection(self):
        await self.join()

        await self.communicator.disconnect()

        communicator = new_communicator(self.user)

        await communicator.connect()
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.state_update(self.party.get_state()))


class PartyTestCase2(TestCaseWithDoubleWebsocket):
    @async_test
    async def test_party_join_and_broadcast(self):
        user2 = self.user2
        party = self.party
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        party_id = party.id

        await communicator1.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        await communicator1.receive_json_from(1)

        await communicator2.send_json_to({
            'command': 'party.join',
            'party_id': party_id,
        })
        await communicator2.receive_json_from(1)

        resp = await communicator1.receive_json_from(1)
        self.assertDictEqual(resp, event.party_join(user2.id))

    @async_test
    async def test_party_leave(self):
        user1 = self.user1
        user2 = self.user2
        party = self.party
        state = self.state
        communicator1 = self.communicator1
        communicator2 = self.communicator2

        await self.join_both()

        await communicator2.send_json_to({
            'command': 'party.leave',
        })

        resp = await communicator1.receive_json_from(1)
        self.assertDictEqual(resp, event.party_leave(user2.id))

        party.refresh_from_db()
        state.refresh_from_db()
        self.assertEqual(len(state.member_ids), 1)
        self.assertEqual(state.member_ids[0], user1.id)
        self.assertEqual(party.member_count, 1)
        self.assertIsNone(cache.get('user-party:{}'.format(user2.id)))

    @async_test
    async def test_change_leader_on_leaving(self):
        await self.join_both()

        await self.communicator1.send_json_to({
            'command': 'party.leave'
        })
        await self.communicator2.receive_json_from(1)

        self.party.refresh_from_db()
        self.assertEqual(self.party.leader, self.user2)

    @async_test
    async def test_already_joined_connection_receive_broadcast(self):
        await self.join_both()

        await self.communicator1.disconnect()

        communicator = new_communicator(self.user1)

        await communicator.connect()
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.state_update(self.party.get_state()))

        await self.communicator2.send_json_to({
            'command': 'party.leave',
        })

        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.party_leave(self.user2.id))
