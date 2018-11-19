from . import error


def party_join(user_id: int):
    return {
        'type': 'party.join',
        'user_id': user_id,
    }


def party_leave(user_id: int):
    return {
        'type': 'party.leave',
        'user_id': user_id,
    }


def menu_create(menu_entry_id: int, menu_id: int, quantity: int, users: list):
    return {
        'type': 'menu.create',
        'menu_entry_id': menu_entry_id,
        'menu_id': menu_id,
        'quantity': quantity,
        'users': users,
    }


def menu_update(menu_entry_id: int, quantity: int, add_user_ids: list, remove_user_ids: list):
    return {
        'type': 'menu.update',
        'menu_entry_id': menu_entry_id,
        'quantity': quantity,
        'add_user_ids': add_user_ids,
        'remove_user_ids': remove_user_ids,
    }


def menu_delete(menu_entry_id: int):
    return {
        'type': 'menu.delete',
        'menu_entry_id': menu_entry_id,
    }


def state_update(state):
    return {
        'type': 'state.update',
        'state': state.as_dict(),
    }


def initially_not_joined():
    return {
        'type': 'initial.not.joined',
    }


def leader_change(user_id: int):
    return {
        'type': 'leader.change',
        'user_id': user_id,
    }
