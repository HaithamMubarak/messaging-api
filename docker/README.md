# Docker — Running the messaging-service

This document focuses on using the published Docker image for the `messaging-service` and the repo's Docker Compose files for easy local testing.

Published image
- Image: `haithammubarak/messaging-platform:messaging-service`
- Tags / releases: [haithammubarak/messaging-platform:messaging-service](https://hub.docker.com/repository/docker/haithammubarak/messaging-platform/tags/messaging-service)

Recommended ways to run

1) Use the hub compose file (recommended if you don't need to build locally)
- This compose file includes the messaging service and its dependencies (Redis, Kafka, Postgres) and references the published image.

Windows (cmd.exe):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml up -d --pull --no-build
```

Foreground (stream logs):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml up --pull --no-build
```

Stop and remove containers + volumes:

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml down -v
```

POSIX (bash/zsh) equivalents:

```sh
cd /path/to/messaging-platform/docker
docker compose -f docker-compose.hub.yml up -d --pull --no-build
```

2) Pull the image directly

```sh
docker pull haithammubarak/messaging-platform:messaging-service
```

3) Use the repository compose to build local images (when you are developing)

The repo compose file `docker/docker-compose.yml` builds images from local sources. Use this when you want to run code you changed locally.

Windows (cmd.exe):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose up --build -d
```

To run only core services (example):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose up -d --build redis kafka postgres messaging-service
```

Why use the hub image
- Fast startup for demos and CI (no local build step).
- Useful when you want to test integration without rebuilding the Java service.

Caveat
- The hub image contains a built artifact from the project owner. If you change code in `services/messaging-service` you must build locally (use the repo compose or Gradle build) to test your changes.

Useful commands
- View service logs (follow):

```sh
docker compose -f docker-compose.hub.yml logs -f messaging-service
```

- List images:

```sh
docker images | grep messaging-platform || docker images haithammubarak/messaging-platform
```

- Check running containers:

```sh
docker ps
```

Troubleshooting
- If ports conflict, stop the conflicting service or update the compose file to use different ports.
- Ensure Docker Desktop / engine is running.
- On Windows, check WSL2/Hyper-V settings if containers fail to start.

Questions / next steps
- If you'd like I can add a short CI snippet that pulls the hub image and runs integration smoke tests, or add a `docker/.env.example` describing configurable ports and credentials.
