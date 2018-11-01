from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json


def reply_error(reason, data):
    return json.dumps({
        'error': reason,
        'data': data,
    })


class PartyStateConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.party_id = self.scope['url_route']['kwargs']['party_id']
        self.group_id = 'party_{}'.format(self.party_id)

        await self.channel_layer.group_add(
            self.group_id,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_id,
            self.party_id,
        )

    async def receive_json(self, msg):
        event = msg['event']
        data = msg['data']

        await self.channel_layer.group_send(
            self.group_id,
            {
                'type': event.replace('-', '_'),
                'data': data,
            }
        )

    async def party_joined(self, data):
        data = data['data']
        print("joined: {}".format(data))
