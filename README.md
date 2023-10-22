# URL Shortener

## Introduction

[Demonstration](https://github.com/anthonyhastings/url-shortener/assets/167421/56ee1a3b-3f47-46ff-9213-f837775284af)

This repository showcases an express service backed by a MongoDB database. It exposes an API that allows for the creation and visiting of shortened URLs. While the service itself is fully functional, the real purpose of this repository is to demonstrate other useful tools that make development easier:

- **Docker Healthchecks:** Allows docker to test containers and confirm not only that they’re running but that they’re “healthy”. Containers with healthchecks have a health status in addition to their normal status. This extra status can be used to control startup order of containers.

- **Compose Watch:** Automatically updates running composed services with updates to files being watched. These changes can either update files within the running container or trigger an entire rebuild of the container.

- **Testcontainers:** Provides a programatic way of using docker containers for dependent services within integration tests. This means we need to stub / mock less and can have actual integration with databases and services our own application relies upon.

- **Environment Variable Validation:** Using Zod, we can ensure that required environment variables are in place as soon as our application boots up. This gives us a quicker feedback loop to spot misconfigured environments that might only become obvious at a later time when functionality that uses the environment variables gets invoked and fails.

## Instructions

These instructions will assume that the system already has Docker and Docker Compose present. Firstly, get the containers for the database and the application up and running:

```sh
docker compose down && docker compose build && docker compose up
```

While the containers are starting, you can have docker list them out to see their container status and health status:

```sh
docker ps --all
```

You’ll note that, thanks to the `depends_on` declarations, the application container won't attempt to start until the database container considers itself healthy. You can also inspect a container for detailed healthcheck logging:

```sh
docker inspect --format "{{json .State.Health }}" url-shortener-database-1 | jq
```

Then in another terminal, start watching for source file changes to have them replicated into running containers:

```sh
docker compose alpha watch
```

## Further Information

### Healthchecks

- [`HEALTHCHECK`](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [`healthcheck`](https://docs.docker.com/compose/compose-file/05-services/#healthcheck)
- [`depends_on`](https://docs.docker.com/compose/compose-file/05-services/#depends_on)
- [Control startup and shutdown order in Compose](https://docs.docker.com/compose/startup-order/)

### Compose Watch

- [Compose Watch](https://docs.docker.com/compose/file-watch/)
- [What is Docker Compose Watch and what problem does it solve?](https://collabnix.com/what-is-docker-compose-watch-and-what-problem-does-it-solve/)

### Testcontainers

- [Getting started with Testcontainers for Node.js](https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/)
- [Testcontainers for Node.js](https://node.testcontainers.org/)
- [Testcontainers - GitLab CI](https://java.testcontainers.org/supported_docker_environment/continuous_integration/gitlab_ci/)

### Environment Variable Validation

- [Using Zod to safely read env variables](https://sergiodxa.com/articles/using-zod-to-safely-read-env-variables)
- [Validate Environment Variables With Zod](https://catalins.tech/validate-environment-variables-with-zod/)
