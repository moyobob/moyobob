from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.http import HttpResponseNotAllowed, HttpResponseNotFound
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.utils import IntegrityError
import json
from json.decoder import JSONDecodeError

from .models import User, Party, PartyType, Restaurant, Menu


def HttpResponseOk(*args, **kwargs):
    return HttpResponse(status=200, *args, **kwargs)


def signup(request: HttpRequest):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

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

    return HttpResponseOk()


def signin(request: HttpRequest):
    from django.contrib.auth import authenticate, login

    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

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


def signout(request: HttpRequest):
    from django.contrib.auth import logout

    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    logout(request)

    return HttpResponseOk()


@ensure_csrf_cookie
def verify_session(request: HttpRequest):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])

    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    return JsonResponse(request.user.as_dict())


def party(request: HttpRequest):
    if request.method not in ['GET', 'POST']:
        return HttpResponseNotAllowed(['GET', 'POST'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

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


def party_detail(request: HttpRequest, party_id: int):
    if request.method not in ['GET', 'DELETE']:
        return HttpResponseNotAllowed(['GET', 'DELETE'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    try:
        party = Party.objects.get(id=party_id)
    except Party.DoesNotExist:
        return HttpResponseNotFound()

    if request.method == 'GET':
        return JsonResponse(party.as_dict())
    else:  # DELETE
        if party.leader != request.user:
            return HttpResponseForbidden()

        party.delete()

        return HttpResponseOk()


def restaurant_detail(request: HttpRequest, restaurant_id: int):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
    except Restaurant.DoesNotExist:
        return HttpResponseNotFound()

    return JsonResponse(restaurant.as_dict())


def menu(request: HttpRequest, restaurant_id: int):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        menus = [menu.as_dict() for menu in restaurant.menus.all()]
    except Restaurant.DoesNotExist:
        return HttpResponseNotFound()

    return JsonResponse(menus, safe=False)


def menu_detail(request: HttpRequest, menu_id: int):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    try:
        menu = Menu.objects.get(id=menu_id)
    except Menu.DoesNotExist:
        return HttpResponseNotFound()

    return JsonResponse(menu.as_dict())
