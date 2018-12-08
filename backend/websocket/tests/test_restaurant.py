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
        state = self.state

        await self.join()

        await self.communicator.send_json_to({
            'command': 'restaurant.vote.toggle',
            'restaurant_id': self.restaurant1.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.restaurant_vote(
            self.user.id, self.restaurant1.id))
        state.refresh_from_db()
        self.assertListEqual(
            state.restaurant_votes,
            [
                (self.user.id, self.restaurant1.id),
            ],
        )

        await self.communicator.send_json_to({
            'command': 'restaurant.vote.toggle',
            'restaurant_id': self.restaurant2.id,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.restaurant_vote(
            self.user.id, self.restaurant2.id))
        state.refresh_from_db()
        self.assertListEqual(
            state.restaurant_votes,
            [
                (self.user.id, self.restaurant1.id),
                (self.user.id, self.restaurant2.id),
            ],
        )

        await self.communicator.send_json_to({
            'command': 'restaurant.vote.toggle',
            'restaurant_id': self.restaurant2.id,
        })
        resp = await self.communicator.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(
            resp, event.restaurant_unvote(self.user.id, self.restaurant2.id))
        self.assertListEqual(
            state.restaurant_votes,
            [
                (self.user.id, self.restaurant1.id),
            ],
        )

        await self.communicator.send_json_to({
            'command': 'restaurant.vote.toggle',
            'restaurant_id': self.restaurant1.id,
        })
        resp = await self.communicator.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(
            resp, event.restaurant_unvote(self.user.id, self.restaurant1.id))
        self.assertListEqual(
            state.restaurant_votes,
            [],
        )

    @async_test
    async def test_invalid_restaurant(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'restaurant.vote.toggle',
            'restaurant_id': 0,
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_restaurant())
