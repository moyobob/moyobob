from django.shortcuts import render
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.http import HttpResponseNotAllowed, HttpResponseNotFound
from django.contrib.auth.models import User
import json
from json.decoder import JSONDecodeError


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
    return HttpResponseOk()


def signout(request: HttpRequest):
    from django.contrib.auth import logout

    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    logout(request)
    return HttpResponseOk()
