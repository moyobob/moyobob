from .event import error


class ConsumerException(Exception):
    @classmethod
    def as_dict(cls):  # pragma: no cover
        return {
            'type': 'error',
        }


class InvalidCommandError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_command()


class InvalidDataError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_data()


class InvalidUserError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_user()


class InvalidPartyError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_party()


class InvalidRestaurantError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_restaurant()


class InvalidMenuError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_menu()


class InvalidMenuEntryError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.invalid_menu_entry()


class NotJoinedError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.not_joined()


class NotAuthorizedError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.not_authorized()


class AlreadyJoinedError(ConsumerException):
    @classmethod
    def as_dict(cls):
        return error.already_joined()
