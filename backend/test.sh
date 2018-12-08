#!/bin/bash

echo "Booting up redis..."
redis=$(docker run -p 6379:6379 --rm -d redis:4-alpine)
echo "$redis"

echo "Booting up postgres..."
postgres=$(docker run -p 5432:5432 -e --rm -d postgres:11-alpine)
echo "$postgres"

sleep 1
coverage run --branch --source='./api,./websocket' manage.py test

echo "Stopping redis..."
docker stop "$redis"

echo "Stopping postgres..."
docker stop "$postgres"
