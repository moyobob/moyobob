from django.core.cache import cache
from django.test import TestCase

from websocket import event
from . import async_test, new_communicator
from . import TestCaseWithSingleWebsocket, TestCaseWithDoubleWebsocket
from websocket.models import MenuEntries
from api.models import Party, Menu


class MenuTestCase1(TestCaseWithSingleWebsocket):
    @async_test
    async def test_invalid_menu(self):
        await self.join()

        await self.communicator.send_json_to({
            'command': 'menu.create',
            'menu_id': 0,
            'quantity': 1,
            'user_ids': [self.user.id],
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_menu())

    @async_test
    async def test_invalid_user(self):
        await self.join()

        menu = Menu(name="Rust")
        menu.save()

        await self.communicator.send_json_to({
            'command': 'menu.create',
            'menu_id': menu.id,
            'quantity': 1,
            'user_ids': [0],
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_user())

        await self.communicator.send_json_to({
            'command': 'menu.create',
            'menu_id': menu.id,
            'quantity': 1,
            'user_ids': [self.user.id],
        })
        resp = await self.communicator.receive_json_from(1)
        menu_entry_id = resp['menu_entry_id']

        await self.communicator.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': menu_entry_id,
            'quantity': 1,
            'add_user_ids': [0],
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_user())

        await self.communicator.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': menu_entry_id,
            'quantity': 1,
            'remove_user_ids': [0],
        })
        resp = await self.communicator.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_user())


class MenuTestCase2(TestCaseWithDoubleWebsocket):
    def setUp(self):
        super().setUp()
        self.menu1 = Menu(name="Rust")
        self.menu2 = Menu(name="Cargo")
        self.menu1.save()
        self.menu2.save()

    @async_test
    async def test_menu_create(self):
        user1 = self.user1
        user2 = self.user2
        state = self.state
        communicator1 = self.communicator1
        communicator2 = self.communicator2

        await self.join_both()

        await communicator1.send_json_to({
            'command': 'menu.create',
            'menu_id': self.menu1.id,
            'quantity': 1,
            'user_ids': [user1.id],
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        id1 = resp['menu_entry_id']
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_create(
            id1, self.menu1.id, 1, [user1.id]))
        self.assertTupleEqual(state.menu_entries.get(
            id1), (self.menu1.id, 1, [user1.id]))

        await communicator2.send_json_to({
            'command': 'menu.create',
            'menu_id': self.menu1.id,
            'quantity': 1,
            'user_ids': [user2.id],
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        id2 = resp['menu_entry_id']
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_create(
            id2, self.menu1.id, 1, [user2.id]))
        self.assertTupleEqual(state.menu_entries.get(
            id2), (self.menu1.id, 1, [user2.id]))
        self.assertDictEqual(state.menu_entries.inner, {
            id1: (self.menu1.id, 1, [user1.id]),
            id2: (self.menu1.id, 1, [user2.id]),
        })

    @async_test
    async def test_menu_update(self):
        user1 = self.user1
        user2 = self.user2
        state = self.state
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state.menu_entries.inner = {1: (self.menu1.id, 1, [user1.id])}
        state.save()

        await self.join_both()

        await communicator2.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 1,
            'quantity': 1,
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_update(1, 1, [], []))
        self.assertTupleEqual(state.menu_entries.get(1),
                              (self.menu1.id, 2, [user1.id]))

        await communicator1.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 1,
            'quantity': 1,
            'add_user_ids': [user2.id],
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_update(1, 1, [user2.id], []))
        self.assertTupleEqual(
            state.menu_entries.get(1), (self.menu1.id, 3, [user1.id, user2.id]))

        await communicator2.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 1,
            'quantity': -2,
            'remove_user_ids': [user1.id],
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_update(1, -2, [], [user1.id]))
        self.assertTupleEqual(state.menu_entries.get(1),
                              (self.menu1.id, 1, [user2.id]))

        await communicator2.send_json_to({
            'command': 'menu.update',
            'menu_entry_id': 2,
            'quantity': 1,
        })
        await communicator1.receive_nothing()
        resp = await communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_menu_entry())

    @async_test
    async def test_menu_delete(self):
        user1 = self.user1
        user2 = self.user2
        state = self.state
        communicator1 = self.communicator1
        communicator2 = self.communicator2
        state.menu_entries.inner = {
            1: (self.menu1.id, 1, [user1.id]), 2: (self.menu2.id, 2, [user2.id])}
        state.save()

        await self.join_both()

        await communicator2.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 1,
        })
        await communicator2.receive_json_from(1)
        resp = await communicator1.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_delete(1))
        self.assertIsNone(state.menu_entries.get(1))
        self.assertDictEqual(state.menu_entries.inner,
                             {2: (self.menu2.id, 2, [user2.id])})

        await communicator1.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 2,
        })
        await communicator1.receive_json_from(1)
        resp = await communicator2.receive_json_from(1)
        state.refresh_from_db()
        self.assertDictEqual(resp, event.menu_delete(2))
        self.assertIsNone(state.menu_entries.get(2))
        self.assertDictEqual(state.menu_entries.inner, {})

        await communicator2.send_json_to({
            'command': 'menu.delete',
            'menu_entry_id': 3,
        })
        await communicator1.receive_nothing(1)
        resp = await communicator2.receive_json_from(1)
        self.assertDictEqual(resp, event.error.invalid_menu_entry())

    @async_test
    async def test_leaving_party(self):
        user1 = self.user1
        user2 = self.user2
        state = self.state
        communicator2 = self.communicator2
        state.menu_entries.inner = {
            1: (self.menu1.id, 1, [user1.id]), 2: (self.menu2.id, 2, [user2.id])}
        state.save()

        await self.join_both()

        await communicator2.send_json_to({
            'command': 'party.leave',
        })
        await communicator2.receive_nothing(1)

        state.refresh_from_db()
        self.assertDictEqual(
            state.menu_entries.inner,
            {
                1: (self.menu1.id, 1, [user1.id]),
                2: (self.menu2.id, 2, [])
            },
        )


class MenuEntriesTestCase(TestCase):
    def setUp(self):
        self.entries = MenuEntries()

    def test_add(self):
        self.entries.add(1, 1, [1])
        self.assertDictEqual(self.entries.inner, {1: (1, 1, [1])})
        self.entries.add(2, 2, [2])
        self.assertDictEqual(self.entries.inner, {
                             1: (1, 1, [1]), 2: (2, 2, [2])})

    def test_delete(self):
        self.entries.inner = {1: (1, 1, [1]), 2: (2, 2, [2])}

        self.entries.delete(1)
        self.assertDictEqual(self.entries.inner, {2: (2, 2, [2])})
        self.entries.delete(2)
        self.assertDictEqual(self.entries.inner, {})
        with self.assertRaises(KeyError):
            self.entries.delete(3)

    def test_get(self):
        self.entries.inner = {1: (1, 1, [1]), 2: (2, 2, [2])}

        self.assertTupleEqual(self.entries.get(1), (1, 1, [1]))
        self.assertTupleEqual(self.entries.get(2), (2, 2, [2]))
        self.assertIsNone(self.entries.get(3))

    def test_update(self):
        self.entries.inner = {1: (1, 1, [1])}

        self.entries.update(1, 1)
        self.assertDictEqual(self.entries.inner, {1: (1, 2, [1])})
        self.entries.update(1, 1, add_user_ids=[2])
        self.assertDictEqual(self.entries.inner, {1: (1, 3, [1, 2])})
        self.entries.update(1, -2, remove_user_ids=[1])
        self.assertDictEqual(self.entries.inner, {1: (1, 1, [2])})
        with self.assertRaises(KeyError):
            self.entries.update(2, 1)

    def test_getitem(self):
        self.entries.inner = {1: (1, 1, [1]), 2: (2, 2, [2])}

        self.assertTupleEqual(self.entries[1], (1, 1, [1]))
        self.assertTupleEqual(self.entries[2], (2, 2, [2]))
        with self.assertRaises(KeyError):
            self.entries[3]
