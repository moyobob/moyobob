from websocket import event
from . import async_test, new_communicator
from . import TestCaseWithSingleWebsocket
from api.models import Restaurant


class RestaurantTestCase(TestCaseWithSingleWebsocket):
    def setUp(self):
        super().setUp()

        self.restaurant1 = Restaurant(name="Rustaurant")
        self.restaurant1.save()
        self.restaurant2 = Restaurant(name="Herostaurant")
        self.restaurant2.save()

    @async_test
    async def test_retaurant_vote(self):
        state = self.party.state

        await self.join()

        await self.communicator.send_json_to({
            'command': 'restaurant.vote',
            'restaurant_id': self.restaurant1.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.restaurant_vote(self.restaurant1.id))
        state.refresh_from_db()
        self.assertListEqual(
            state.restaurant_votes,
            [(self.restaurant1.id, 1)],
        )

        await self.communicator.send_json_to({
            'command': 'restaurant.vote',
            'restaurant_id': self.restaurant2.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.restaurant_vote(self.restaurant2.id))
        state.refresh_from_db()
        self.assertListEqual(
            state.restaurant_votes,
            [(self.restaurant1.id, 1), (self.restaurant2.id, 1)],
        )

        await self.communicator.send_json_to({
            'command': 'restaurant.vote',
            'restaurant_id': self.restaurant1.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.restaurant_vote(self.restaurant1.id))
        state.refresh_from_db()
        self.assertListEqual(
            state.restaurant_votes,
            [(self.restaurant1.id, 2), (self.restaurant2.id, 1)],
        )

    @async_test
    async def test_retaurant_unvote(self):
        state = self.party.state
        state.restaurant_votes = [
            (self.restaurant1.id, 1), (self.restaurant2.id, 1)]
        state.save()

        await self.join()

        await self.communicator.send_json_to({
            'command': 'restaurant.unvote',
            'restaurant_id': self.restaurant2.id,
        })
        resp = await self.communicator.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(
            resp, event.restaurant_unvote(self.restaurant2.id))
        self.assertListEqual(
            state.restaurant_votes,
            [(self.restaurant1.id, 1)],
        )

        await self.communicator.send_json_to({
            'command': 'restaurant.unvote',
            'restaurant_id': self.restaurant2.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.not_voted())

    @async_test
    async def test_invalid_restaurant(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'restaurant.vote',
            'restaurant_id': 0,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_restaurant())

        await self.communicator.send_json_to({
            'command': 'restaurant.unvote',
            'restaurant_id': 0,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_restaurant())
