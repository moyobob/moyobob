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


def party_delete():
    return {
        'type': 'party.delete',
    }


def restaurant_vote(user_id: int, restaurant_id: int):
    return {
        'type': 'restaurant.vote',
        'user_id': user_id,
        'restaurant_id': restaurant_id,
    }


def restaurant_unvote(user_id: int, restaurant_id: int):
    return {
        'type': 'restaurant.unvote',
        'user_id': user_id,
        'restaurant_id': restaurant_id,
    }


def menu_create(menu_entry_id: int, menu_id: int, quantity: int, user_ids: list):
    return {
        'type': 'menu.create',
        'menu_entry_id': menu_entry_id,
        'menu_id': menu_id,
        'quantity': quantity,
        'user_ids': user_ids,
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


def menu_confirm(user_id: int):
    return {
        'type': 'menu.confirm',
        'user_id': user_id,
    }


def menu_unconfirm(user_id: int):
    return {
        'type': 'menu.unconfirm',
        'user_id': user_id,
    }


def state_update(state):
    return {
        'type': 'state.update',
        'state': state.as_dict(),
    }


def state_update_dict(state: dict):
    return {
        'type': 'state.update',
        'state': state,
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
