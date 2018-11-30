#!/bin/bash

echo "Booting up redis..."
redis=$(docker run -p 6379:6379 --rm -d redis:4-alpine)

coverage run --branch --source='./api,./websocket' manage.py test

echo "Stopping redis..."
docker stop "$redis" > /dev/null
