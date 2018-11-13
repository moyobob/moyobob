from .models import PartyState


def error(cause: str):
    return {
        'type': 'error',
        'error': cause,
    }


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


def state_update(state: PartyState):
    return {
        'type': 'state.update',
        'state': state.as_dict(),
    }
