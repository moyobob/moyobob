#!/bin/bash

set -e

TYPE=$1
if [ $TYPE = 'install' ]; then
    echo '*** Installing dependencies'
    cd frontend
    npm install
    cd ..
elif [ $TYPE = 'script' ]; then
    cd frontend
    echo '*** Running linter'
    npm run lint
    echo '*** Running unit tests'
    npm run test -- \
        --watch false \
        --browsers ChromeHeadless
    cd ..
elif [ $TYPE = 'after_success' ]; then
    echo '*** Submitting coverage info'
    cd frontend
    ./node_modules/coveralls/bin/coveralls.js .. < ./coverage/lcov.info
    cd ..
fi
