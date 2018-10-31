#!/bin/bash

set -e

TYPE=$1
if [ $TYPE = 'install' ]; then
    echo '*** Installing dependencies'
    pip install -r ./backend/requirements.txt
    pip install -r ./backend/requirements.dev.txt
elif [ $TYPE = 'before' ]; then
    echo '*** Setting up Django'
    export PROJECT_PATH=$(pwd)/backend/backend
    cd backend
    python manage.py migrate
    cd ..
elif [ $TYPE = 'test' ]; then
    cd backend
    echo '*** Running linter'
    flake8 --config ./flake8
    echo '*** Running unit tests'
    coverage run --branch --source="./api" manage.py test
    cp .coverage ..
    cd ..
elif [ $TYPE = 'after' ]; then
    echo '*** Submitting coverage info'
    coveralls
fi
