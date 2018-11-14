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


def menu_assign(user_id: int, menu_id: int):
    return {
        'type': 'menu.assign',
        'user_id': user_id,
        'menu_id': menu_id,
    }


def menu_unassign(user_id: int, menu_id: int):
    return {
        'type': 'menu.unassign',
        'user_id': user_id,
        'menu_id': menu_id,
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
