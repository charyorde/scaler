#!/usr/bin/env bash

# Fail quickly if error occur
set -e

echo "Listing container files in directory $PWD"
ls -al

# Set env vars
# echo "export DATABASE_URL=" > /app/.profile.d/setenv.sh
export
cp setenv.sh .profile.d/

if ! [ -x "$(command -v db-migrate)" ]; then
    # install db-migrate globally
    echo "Installing db-migrate...."
    npm install -g db-migrate
fi

# run db migrations
#DATABASE_URL="postgres://root:r00tu$5r@192.168.10.144:5432/uaa" db-migrate up --config /app/db/database.json
db-migrate up --config db/database.json -e dev

# start the app
node index.js
