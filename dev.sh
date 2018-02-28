#!/usr/bin/env bash
# DEVELOPMENT
# Require:
#   docker 1.16.1+
#   docker-compose 1.14.0+
# Description: Manages services with docker-compose
# Usage:
#   ./dev.sh [COMMAND]
# Commands:
#  <empty>   - start services in detached mode
#  down      - down services
#  restart   - down and up services
#  update    - update sources from git, rebuild vendor if package.json is changed, up services
#  force     - like `update` but force vendor.js rebuild

VENDOR_BUNDLE="./build/assets/scripts/vendor.js"
COMPOSE_FILE="config/dockerfiles/docker-compose.yml"
DC="docker-compose -p gmail -f $COMPOSE_FILE"
PM2="$DC exec frontend pm2"
TOOLS="$DC run --rm tools /bin/sh -c"

SERVICE_UP=$($DC ps -q)
FRONTEND_RUN=$($DC top frontend)

# Server default config
if [ ! -f ./config/server/config.js ]; then
    cp ./config/server/config.js.example ./config/server/config.js
fi

if [ "$1" == "down" ] || [ "$1" == "restart" ]; then
    if [ "" != "$SERVICE_UP" ]; then
        $PM2 flush
        $DC down
    fi
    if [ "$1" == "down" ]; then
        exit $?
    fi
fi

if [ "$1" == "force" ] || [ ! -d ./node_modules ] || [ ! -f $VENDOR_BUNDLE ]; then
    FORCE_INSTALL_BUILD=1
fi

if [ "$1" == "update" ] || [ ! -z "$FORCE_INSTALL_BUILD" ]; then
    if [ -n "$FRONTEND_RUN" ]; then
        $PM2 stop all
        PM2_STOPPED=1
    fi


    # Take previous commit hash from file or take first commit
    LAST_CI=$(head -n 1 .ci 2> /dev/null)

    if [ -z "$LAST_CI" ]; then
        $($TOOLS "git rev-list --reverse HEAD | head -n 1 > .ci")
        LAST_CI=$(head -n 1 .ci 2> /dev/null)
    fi

    # Save current commit hash
    echo $($TOOLS "git log --format=%h -1 > .ci")

    # Detect dependencies are changed and build vendor bundle
    PACKAGE_HAS_CHANGED=$($TOOLS "git diff $LAST_CI HEAD --name-only | grep package.json")

    if [ ! -z "$PACKAGE_HAS_CHANGED" ] || [ ! -z "$FORCE_INSTALL_BUILD" ]; then
        $TOOLS "npm install -s"
        $TOOLS "NODE_ENV=production gulp vendor"
        $TOOLS "gulp theme"
    fi
fi

sudo rm -rf ./build/server/

# Frontend start/restart
if [ -z "$SERVICE_UP" ] || [ "$1" == "restart" ]; then
    $DC up -d
elif [ -z "$FRONTEND_RUN" ] || [ ! -z "$PM2_STOPPED" ]; then
    $DC start frontend
    $DC restart nginx
#elif [ ! -z "$PM2_STOPPED" ]; then
#    $PM2 restart all
fi

echo "================"
echo "Useful commands"
echo "  compose ps|start|stop|down|up|..."
echo "  tools gulp vendor"
echo "  front pm2 restart all|server|client"
echo "  front pm2 logs|status|dash"
echo "with"
echo "  COMPOSE=\"$DC\""
echo '  alias compose="$COMPOSE"'
echo '  alias tools="$COMPOSE run --rm -it tools"'
echo '  alias front="$COMPOSE exec frontend"'
