def invalid_command():
    return {
        'type': 'error.invalid.command',
    }


def invalid_data():
    return {
        'type': 'error.invalid.data',
    }


def invalid_party():
    return {
        'type': 'error.invalid.party',
    }


def not_joined():
    return {
        'type': 'error.not.joined',
    }


def already_joined():
    return {
        'type': 'error.already.joined',
    }


def already_assigned():
    return {
        'type': 'error.already.assigned',
    }


def not_assigned():
    return {
        'type': 'error.not.assigned',
    }
