FROM node:22-alpine AS base

LABEL maintainer="Anthony Hastings <ar.hastings@gmail.com>"

USER node

WORKDIR /url-shortener

COPY --chown=node ./package.json ./pnpm-lock.yaml ./

RUN pnpm install --prefer-offline

COPY --chown=node . ./

CMD pnpm start