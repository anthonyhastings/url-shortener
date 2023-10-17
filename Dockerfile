FROM node:20-alpine AS base

LABEL maintainer="Anthony Hastings <ar.hastings@gmail.com>"

USER node

WORKDIR /url-shortener

COPY --chown=node ./package.json ./yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY --chown=node . ./

CMD yarn start