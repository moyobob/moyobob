from websocket import event
from . import async_test, new_communicator
from . import TestCaseWithSingleWebsocket, TestCaseWithDoubleWebsocket
from api.models import Restaurant


class PhaseTestCase1(TestCaseWithSingleWebsocket):
    @async_test
    async def test_phase_transition(self):
        pass


class PhaseTestCase2(TestCaseWithDoubleWebsocket):
    @async_test
    async def test_not_authorized(self):
        await self.join_both()

        await self.communicator2.send_json_to({
            'command': 'to.choosing.menu',
            'restaurant_id': 0,
        })
        resp = await self.communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.not_authorized())

        await self.communicator2.send_json_to({
            'command': 'to.ordering',
        })
        resp = await self.communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.not_authorized())

        await self.communicator2.send_json_to({
            'command': 'to.ordered',
        })
        resp = await self.communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.not_authorized())

        await self.communicator2.send_json_to({
            'command': 'to.payment',
            'paid_user_id': 0,
        })
        resp = await self.communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.not_authorized())
