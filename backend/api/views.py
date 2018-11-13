from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.http import HttpResponseNotAllowed, HttpResponseNotFound
from django.contrib.auth.models import User
import json
from json.decoder import JSONDecodeError

from .models import Party, PartyType


def user_as_dict(user: User):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }


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

    User.objects.create_user(username=username, password=password, email=email)

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
    return JsonResponse(user_as_dict(user))


def signout(request: HttpRequest):
    from django.contrib.auth import logout

    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    logout(request)

    return HttpResponseOk()


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
