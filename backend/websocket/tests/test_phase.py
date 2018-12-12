from websocket import event
from . import async_test, new_communicator
from . import TestCaseWithSingleWebsocket, TestCaseWithDoubleWebsocket
from api.models import Restaurant
from websocket.models import PartyPhase


class PhaseTestCase1(TestCaseWithSingleWebsocket):
    @async_test
    async def test_phase_transition(self):
        state = self.state

        await self.join()

        restaurant = Restaurant(name="Rustaurant")
        restaurant.save()

        await self.communicator.send_json_to({
            'command': 'to.choosing.menu',
            'restaurant_id': restaurant.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.party.refresh_from_db()
        state.refresh_from_db()
        self.assertDictEqual(resp, event.state_update(state))
        self.assertEqual(state.phase, PartyPhase.ChoosingMenu)
        self.assertEqual(state.restaurant_id, restaurant.id)
        self.assertEqual(self.party.restaurant.id, restaurant.id)

        await self.communicator.send_json_to({
            'command': 'to.ordering',
        })
        resp = await self.communicator.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.state_update(state))
        self.assertEqual(state.phase, PartyPhase.Ordering)

        await self.communicator.send_json_to({
            'command': 'to.ordered',
        })
        resp = await self.communicator.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.state_update(state))
        self.assertEqual(state.phase, PartyPhase.Ordered)

        await self.communicator.send_json_to({
            'command': 'to.payment',
            'paid_user_id': self.user.id,
        })
        resp = await self.communicator.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.state_update(state))
        self.assertEqual(state.phase, PartyPhase.PaymentAndCollection)
        self.assertEqual(state.paid_user_id, self.user.id)

    @async_test
    async def test_invalid_restaurant(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'to.choosing.menu',
            'restaurant_id': 0,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_restaurant())

    @async_test
    async def test_invalid_user(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'to.payment',
            'paid_user_id': 0,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_user())


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
