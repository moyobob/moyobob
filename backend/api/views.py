from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.http import HttpResponseNotAllowed, HttpResponseNotFound
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.utils import IntegrityError
from django.contrib.auth import authenticate, login, logout
import json
from json.decoder import JSONDecodeError

from .models import User, Party, PartyType, Restaurant, Menu, Payment
from .decorator import allow_authenticated, allow_method
from .decorator import get_user, get_menu, get_party, get_payment, get_restaurant
from .util import make_record


@allow_method(['POST'])
def signup(request: HttpRequest):
    try:
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        email = req_data['email']
    except (JSONDecodeError, KeyError):
        return HttpResponseBadRequest()

    try:
        User.objects.create_user(
            username=username, password=password, email=email)
    except IntegrityError:
        return HttpResponseBadRequest()

    return HttpResponse()


@allow_method(['POST'])
def signin(request: HttpRequest):
    try:
        req_data = json.loads(request.body.decode())
        email = req_data['email']
        password = req_data['password']
    except (JSONDecodeError, KeyError):
        return HttpResponseBadRequest()

    user = authenticate(request, email=email, password=password)

    if user is None:
        return HttpResponseForbidden()

    login(request, user)
    return JsonResponse(user.as_dict())


@allow_method(['GET'])
@allow_authenticated
def signout(request: HttpRequest):
    logout(request)

    return HttpResponse()


@ensure_csrf_cookie
def verify_session(request: HttpRequest):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])

    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    return JsonResponse(request.user.as_dict())


@allow_method(['GET'])
@allow_authenticated
@get_user
def user_detail(request: HttpRequest, user: User):
    return JsonResponse(user.as_dict())


@allow_method(['GET', 'POST'])
@allow_authenticated
def party(request: HttpRequest):
    if request.method == 'GET':
        party_list = [party.as_dict() for party in Party.objects.all()]
        return JsonResponse(party_list, safe=False)
    else:  # POST
        try:
            req_data = json.loads(request.body.decode())
            name = req_data['name']
            type = req_data['type']
            location = req_data['location']
            leader = request.user
        except (JSONDecodeError, KeyError, ValueError):
            return HttpResponseBadRequest()

        party = Party(name=name, type=type, location=location, leader=leader)
        party.save()

        return JsonResponse(party.as_dict(), safe=False)


@allow_method(['GET', 'DELETE'])
@allow_authenticated
@get_party
def party_detail(request: HttpRequest, party: Party):
    if request.method == 'GET':
        return JsonResponse(party.as_dict())
    else:  # DELETE
        if party.leader != request.user:
            return HttpResponseForbidden()

        state = party.get_state()
        if state is not None:
            make_record(state)
            state.delete()
        party.delete()

        return HttpResponse()


@allow_method(['GET'])
@allow_authenticated
def restaurant(request: HttpRequest):
    restaurant_list = [
        restaurant.as_dict()
        for restaurant in Restaurant.objects.all()
    ]
    return JsonResponse(restaurant_list, safe=False)


@allow_method(['GET'])
@allow_authenticated
@get_restaurant
def restaurant_detail(request: HttpRequest, restaurant: Restaurant):
    return JsonResponse(restaurant.as_dict())


@allow_method(['GET'])
@allow_authenticated
@get_restaurant
def menu(request: HttpRequest, restaurant: Restaurant):
    menus = [menu.as_dict() for menu in restaurant.menus.all()]

    return JsonResponse(menus, safe=False)


@allow_method(['GET'])
@allow_authenticated
@get_menu
def menu_detail(request: HttpRequest, menu: Menu):
    return JsonResponse(menu.as_dict())


@allow_method(['GET'])
@allow_authenticated
def party_records(request: HttpRequest):
    records = request.user.party_records.all()

    return JsonResponse([record.as_dict() for record in records], safe=False)


@allow_method(['GET'])
@allow_authenticated
def payments(request: HttpRequest):
    payments = request.user.payments.filter(resolved=False).all()

    return JsonResponse([payment.as_dict() for payment in payments], safe=False)


@allow_method(['GET'])
@allow_authenticated
def collections(request: HttpRequest):
    collections = request.user.collections.filter(resolved=False).all()

    return JsonResponse([payment.as_dict() for payment in collections], safe=False)


@allow_method(['GET'])
@allow_authenticated
@get_payment
def resolve_payment(request: HttpRequest, payment: Payment):
    if payment.paid_user != request.user:
        return HttpResponseForbidden()

    payment.resolved = True
    payment.save()

    return HttpResponse()
