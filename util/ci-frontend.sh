#!/bin/bash

set -e

TYPE=$1
if [ $TYPE = 'before_install' ]; then
    echo '*** Running xvfb'
    sh -e /etc/init.d/xvfb start
elif [ $TYPE = 'install' ]; then
    echo '*** Installing dependencies'
    cd frontend
    npm install
    npm install coveralls
    cd ..
elif [ $TYPE = 'before_script' ]; then
    echo '*** Nothing to do'
elif [ $TYPE = 'script' ]; then
    cd frontend
    echo '*** Running linter'
    npm run lint
    echo '*** Running unit tests'
    npm run test -- --code-coverage --watch false
    cd ..
elif [ $TYPE = 'after_success' ]; then
    echo '*** Submitting coverage info'
    cd frontend
    ./node_modules/coveralls/bin/coveralls.js .. < ./coverage/lcov.info
    cd ..
fi
