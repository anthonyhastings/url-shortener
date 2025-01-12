FROM node:22-alpine AS base

LABEL maintainer="Anthony Hastings <ar.hastings@gmail.com>"

RUN corepack enable

USER node

WORKDIR /url-shortener

COPY --chown=node ./package.json ./pnpm-lock.yaml ./

RUN corepack install

RUN pnpm install --frozen-lockfile

COPY --chown=node . ./

CMD pnpm start