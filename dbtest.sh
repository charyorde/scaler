#!/usr/bin/env bash

if psql -lqt -U postgres | cut -d \| -f 1 | grep -w microapps; then
    echo "Database exists"
else
    echo "Database not exist"
    createdb microapps;
fi
