# PRODUCTION
FROM node:8-alpine

ENV NODE_PATH /usr/local/lib/node_modules

RUN npm install -g -s pm2

RUN chown -R node.node /usr/local/lib/node_modules

VOLUME ["/app"]

WORKDIR /app

