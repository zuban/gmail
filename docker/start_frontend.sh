#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker-compose -p gmail -f frontend_dev_pm.yml build
docker-compose -p gmail -f frontend_dev_pm.yml up -d

