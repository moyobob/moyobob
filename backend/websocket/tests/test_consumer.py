from . import TestCaseWithSingleWebsocket, async_test
from websocket import event
from websocket.models import PartyPhase


class ConsumerTestCase(TestCaseWithSingleWebsocket):
    @async_test
    async def test_invalid_command(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'foo',
            'data': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_command())

    @async_test
    async def test_invalid_data(self):
        communicator = self.communicator

        await communicator.send_json_to({
            'command': 'party.join',
            'foo': 'bar',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_data())

    @async_test
    async def test_command_not_allowed(self):
        communicator = self.communicator

        await self.join()

        state = self.state
        state.phase = PartyPhase.ChoosingMenu
        state.save()

        await communicator.send_json_to({
            'command': 'to.choosing.menu',
            'restaurant_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        state = self.state
        state.phase = PartyPhase.ChoosingRestaurant
        state.save()

        await communicator.send_json_to({
            'command': 'to.ordering',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        await communicator.send_json_to({
            'command': 'to.ordered',
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        await communicator.send_json_to({
            'command': 'to.payment',
            'paid_user_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        state = self.state
        state.phase = PartyPhase.ChoosingMenu
        state.save()

        await communicator.send_json_to({
            'command': 'restaurant.vote.toggle',
            'restaurant_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        state = self.state
        state.phase = PartyPhase.ChoosingRestaurant
        state.save()

        await communicator.send_json_to({
            'command': 'menu.create',
            'menu_id': 0,
            'quantity': 0,
            'user_ids': [],
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        await communicator.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 0,
            'quantity': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())

        await communicator.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 0,
        })
        resp = await communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.command_not_allowed())
