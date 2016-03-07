#!/usr/bin/env bash

set -e

echo "Working dir $PWD"
echo "Listing container files in directory $PWD"
ls -al

export

main() {
    # Build
    npm install | tee
    if [ ! "$?" -eq "0" ]
    then
        echo "Install app failed"
        exit 1
    fi

    export

    if ! [ -x "$(command -v db-migrate)" ]; then
        # install db-migrate globally
        echo "Installing db-migrate...."
        npm install -g db-migrate
    fi

    # run db migrations
    db-migrate up --config /app/db/database.json -e docker

    # start the app
    node /app/index.js
}

main
