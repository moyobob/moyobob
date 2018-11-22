from . import TestCaseWithSingleWebsocket, async_test
from websocket import event


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
