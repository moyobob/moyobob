from django.http import HttpRequest
from django.http import HttpResponseNotAllowed, HttpResponseForbidden, HttpResponseNotFound
from functools import wraps

from .models import Party, Restaurant, Menu, Payment


def allow_method(methods: list):
    def __decorator(func):
        @wraps(func)
        def __wrapper(request: HttpRequest, *args, **kwargs):
            if request.method not in methods:
                return HttpResponseNotAllowed(methods)
            else:
                return func(request, *args, **kwargs)
        return __wrapper
    return __decorator


def allow_authenticated(func):
    @wraps(func)
    def __wrapper(request: HttpRequest, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden()
        else:
            return func(request, *args, **kwargs)
    return __wrapper


def get_party(func):
    @wraps(func)
    def __wrapper(request: HttpRequest, party_id: int, *args, **kwargs):
        try:
            party = Party.objects.get(id=party_id)
        except Party.DoesNotExist:
            return HttpResponseNotFound()
        return func(request, party, *args, **kwargs)
    return __wrapper


def get_restaurant(func):
    @wraps(func)
    def __wrapper(request: HttpRequest, restaurant_id: int, *args, **kwargs):
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return HttpResponseNotFound()
        return func(request, restaurant, *args, **kwargs)
    return __wrapper


def get_menu(func):
    @wraps(func)
    def __wrapper(request: HttpRequest, menu_id: int, *args, **kwargs):
        try:
            menu = Menu.objects.get(id=menu_id)
        except Menu.DoesNotExist:
            return HttpResponseNotFound()
        return func(request, menu, *args, **kwargs)
    return __wrapper


def get_payment(func):
    @wraps(func)
    def __wrapper(request: HttpRequest, payment_id: int, *args, **kwargs):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return HttpResponseNotFound()
        return func(request, payment, *args, **kwargs)
    return __wrapper
