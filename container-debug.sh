#!/usr/bin/env bash

set -e

echo "OS details: $(uname -a)"
echo "Working dir $PWD"
echo "Listing container files in directory $PWD"
ls -al

CHOST=$(/sbin/ip route|awk '/default/ { print $3 }')
echo "Running container host: $CHOST"
export

main() {
    # Build
    npm install | tee
    if [ ! "$?" -eq "0" ]
    then
        echo "Install app failed"
        exit 1
    fi

    setupRabbit

    setupPostgres

    export

    if ! [ -x "$(command -v db-migrate)" ]; then
        # install db-migrate globally
        echo "Installing db-migrate...."
        npm install -g db-migrate
    fi

    # run db migrations
    db-migrate up --config /app/db/database.json -e docker

    # start the app
    node index.js
}

setupRabbit() {
    # setup rabbitmq
    echo 'Setting up RabbitMQ...'
    if ! [ -x "$(command -v rabbitmqctl)" ]; then
        echo "deb http://www.rabbitmq.com/debian/ testing main" >> /etc/apt/sources.list
        curl http://www.rabbitmq.com/rabbitmq-signing-key-public.asc | apt-key add -
        apt-get update
        apt-get install -y rabbitmq-server
        service rabbitmq-server start
        if service rabbitmq-server status | cut -d \{ -f 2 | awk '/pid/'; then
            echo "RabbitMQ is running..."
            export RABBIT_HOST=$CHOST
            export RABBIT_USER=guest
            export RABBIT_PASS=guest
            export RABBIT_PORT=5672
        else
            service rabbitmq-server start
            export RABBIT_HOST=$CHOST
            export RABBIT_USER=guest
            export RABBIT_PASS=guest
            export RABBIT_PORT=5672
        fi
    else
        checkOrStartRabbit
    fi

}

setupPostgres() {
    # setup postgres
    if ! [ -x "$(command -v psql)" ]; then
        echo "Installing postgresql..."
        apt-get install -y postgresql-9.4
        #service postgresql start
        if psql -lqt -U postgres | cut -d \| -f 1 | grep -w microapps; then
            echo "Database exists"
        else
            echo "Database not exist"
            createdb -U postgres -w microapps
        fi
        if service postgresql status | grep -ioE '\(.*?\)'; then
            echo "Postgres is running..."
            # export postgres env
            export POSTGRES_USER=postgres
            export POSTGRES_PASS=postgres
            export POSTGRES_DB=microapps
            export POSTGRES_HOST=$CHOST
            export POSTGRES_PORT=5432
        else
            service postgresql start
            export POSTGRES_USER=postgres
            export POSTGRES_PASS=postgres
            export POSTGRES_DB=microapps
            export POSTGRES_HOST=$CHOST
            export POSTGRES_PORT=5432
        fi
    else
        checkOrStartPostgres
    fi
}

checkOrStartRabbit() {
    if service rabbitmq-server status | cut -d \{ -f 2 | awk '/pid/'; then
        echo "RabbitMQ is running..."
        export RABBIT_HOST=$CHOST
        export RABBIT_USER=guest
        export RABBIT_PASS=guest
        export RABBIT_PORT=5672
    else
        service rabbitmq-server start
        export RABBIT_HOST=$CHOST
        export RABBIT_USER=guest
        export RABBIT_PASS=guest
        export RABBIT_PORT=5672
    fi
}

checkOrStartPostgres() {

    if service postgresql status | grep -ioE '\(.*?\)'; then
        echo "Postgres is running..."
        # export postgres env
        export POSTGRES_USER=postgres
        export POSTGRES_PASS=postgres
        export POSTGRES_DB=microapps
        export POSTGRES_HOST=$CHOST
        export POSTGRES_PORT=5432
    else
        service postgresql start
        export POSTGRES_USER=postgres
        export POSTGRES_PASS=postgres
        export POSTGRES_DB=microapps
        export POSTGRES_HOST=$CHOST
        export POSTGRES_PORT=5432
    fi
}

main
