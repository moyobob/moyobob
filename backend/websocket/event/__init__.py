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


def menu_assign(menu_id: int, quantity: int, users: list):
    return {
        'type': 'menu.assign',
        'menu_id': menu_id,
        'quantity': quantity,
        'users': users,
    }


def menu_unassign(menu_id: int, quantity: int, users: list):
    return {
        'type': 'menu.unassign',
        'menu_id': menu_id,
        'quantity': quantity,
        'users': users,
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
