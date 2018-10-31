from django.shortcuts import render
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.http import HttpResponseNotAllowed, HttpResponseNotFound
from django.contrib.auth.models import User
import json
from json.decoder import JSONDecodeError


def HttpResponseOk():
    return HttpResponse(status=200)


def HttpResponseCreated():
    return HttpResponse(status=201)


def HttpResponseNoContent():
    return HttpResponse(status=204)


def HttpResponseUnauthorized():
    return HttpResponse(status=401)


def signup(request: HttpRequest):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    try:
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        email = req_data['email']
        first_name = req_data['first_name']
    except (JSONDecodeError, KeyError):
        return HttpResponseBadRequest()

    User.objects.create_user(
        username=username, password=password, email=email, first_name=first_name)

    return HttpResponseCreated()


def signin(request: HttpRequest):
    from django.contrib.auth import authenticate, login

    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    try:
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
    except (JSONDecodeError, KeyError):
        return HttpResponseBadRequest()

    user = authenticate(request, username=username, password=password)

    if user is None:
        return HttpResponseUnauthorized()

    login(request, user)
    return HttpResponseNoContent()


def signout(request: HttpRequest):
    from django.contrib.auth import logout

    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    if not request.user.is_authenticated:
        return HttpResponseUnauthorized()

    logout(request)
    return HttpResponseNoContent()
