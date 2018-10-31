#!/bin/bash

set -e

TYPE=$1
if [ $TYPE = 'install' ]; then
    echo '*** Installing dependencies'

    cd frontend

    npm install
    npm install coveralls

    cd ..
elif [ $TYPE = 'before' ]; then
    echo '*** Nothing to do'
elif [ $TYPE = 'test' ]; then
    export CHROME_BIN=/usr/bin/google-chrome
    export DISPLAY=:99.0

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
