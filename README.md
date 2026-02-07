# Demo - Messaging API (Deprecated)


> Note: the previous `origin-service` content has been moved to the branch `demo/origin-service-structure` and is deprecated (removed from the `main` branch).


The **Messaging API** is a lightweight, agent-driven messaging platform enabling secure peer-to-peer communication through a relay service.  
It supports **Web, Java, and Python agents** with **end-to-end encryption (AES-CTR)**.

---

## 🔒 Access to SDK Production Repository

> **SDK Production Repository:** [[HaithamMubarak/messaging-platform-sdk](https://github.com/HaithamMubarak/messaging-platform)](https://github.com/HaithamMubarak/messaging-platform-sdk)

> The current repository showcases a **demo version** of the Messaging Platform project — a simplified public version for learning, exploration, and preview purposes.

> **Note:** This is a **demo source code repository** intended for preview and educational use.  
> The production version includes enhanced features, optimizations, and deployment-ready configurations.


## 🚀 Overview

### Core Idea
- Secure agent-to-agent messaging.
- The server is a stateless relay (no decryption of payloads).
- Encryption key derived from `channelName + channelPassword`.

### Components
- Web Agent (browser UI) — `agents/web-agent`
- Java Agent (library + example app) — `agents/java-agent`
- Python Agent (package + example script) — `agents/python-agent`
- Messaging Service (Java/Spring Boot relay) — `services/messaging-service`

---

## 📚 Documentation
- Communication Algorithm → `docs/communication-algorithm.md`
- Request/Response Examples → `docs/examples.md`
- Agents Guide → `agents/README.md`
- Services Guide → `services/README.md`
- Docker / local dev compose → `docker/README.md`

---

## ⚡ Quick Start (developer)

[![Latest tag](https://img.shields.io/docker/v/haithammubarak/messaging-platform?label=latest&logo=docker)](https://hub.docker.com/repository/docker/haithammubarak/messaging-platform/tags/messaging-service)

Docker image: [haithammubarak/messaging-platform:messaging-service](https://hub.docker.com/repository/docker/haithammubarak/messaging-platform/tags/messaging-service)

1) Docker Compose (recommended)

Windows (cmd.exe):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose up --build
```

POSIX (bash/zsh):

```sh
cd /path/to/messaging-platform/docker
docker compose up --build
```

Note: a pre-built messaging service image is published on Docker Hub: `haithammubarak/messaging-platform:messaging-service` ([haithammubarak/messaging-platform:messaging-service](https://hub.docker.com/repository/docker/haithammubarak/messaging-platform/tags/messaging-service)). You can pull that image instead of building locally — see the Docker section below for details and examples.  

2) Alternative — Run the Messaging Service locally (Windows CMD)

```bat
cd /d C:\Users\admin\dev\messaging-platform
gradlew.bat :services:messaging-service:bootRun
```

Then open the Web Agent:
- http://localhost:8080/messaging-platform/web-agent/index.html

3) Java Agent Example (from repo root)

```bat
gradlew.bat :agents:examples:java-agent-chat:run --args="--channel system001 --password 12345678 --agent-name java-agent-example-001"
```

4) Python Agent Example (from example folder)

```bat
cd /d C:\Users\admin\dev\messaging-platform\agents\examples\python-agent-chat
python chat_example.py --url http://localhost:8082/messaging-platform/api/v1/messaging-service --channel system001 --password 12345678 --agent-name python-agent-example-001
```

---

## 🛠 Main commands

Below are the canonical copy/paste commands for starting and stopping the stack. Helper scripts have been removed — use these Docker Compose and Gradle commands directly.

A) Repo (default) compose — build images from local sources

Windows (cmd.exe):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose up --build -d
```

POSIX:

```sh
cd /path/to/messaging-platform/docker
docker compose up --build -d
```

Start only core services and build:

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose up -d --build redis kafka postgres messaging-service
```

Stop and remove containers + volumes (repo compose):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose down -v
```

B) Hub-image compose — use published messaging-service image (no local build)

This repository includes `docker/docker-compose.hub.yml` which is a self-contained compose file (redis, kafka, postgres, messaging-service) that references the published image `haithammubarak/messaging-platform:messaging-service`.

Start (pull published image, do not build local images):

Windows (detached):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml up -d --pull --no-build
```

POSIX (detached):

```sh
cd /path/to/messaging-platform/docker
docker compose -f docker-compose.hub.yml up -d --pull --no-build
```

Foreground (logs):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml up --pull --no-build
```

Stop and remove containers + volumes (hub compose):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml down -v
```

C) Gradle convenience task (repository-local compose)

The root `build.gradle` defines a convenience task `messagingServiceUp` which builds the `services:messaging-service` artifact and brings up a Docker Compose stack.

Run (default — build + repo compose):

```bat
cd /d C:\Users\admin\dev\messaging-platform
gradlew.bat messagingServiceUp
```

Behavior details
- The Gradle helper task builds the `services:messaging-service` JAR (dependency) and runs `docker compose -f docker/docker-compose.yml up --build -d`.

Notes
- The Gradle helper no longer supports selecting the hub compose file; it always uses the repository `docker/docker-compose.yml`.

Companion task
- `messagingServiceDown` is available to stop and remove the compose stack and volumes (it uses the same compose file selection as `messagingServiceUp`).

Where it's defined
- File: `build.gradle` at the repository root (top-level project). Search for `tasks.register('messagingServiceUp'`).

## Docker (recommended)

This project ships with two compose files in `docker/`:
- `docker/docker-compose.yml` — the default compose file that builds local images from source.
- `docker/docker-compose.hub.yml` — an alternate compose file that references a published messaging-service image on Docker Hub.

When to use which
- Develop locally or make code changes: use the default repo compose (`docker/docker-compose.yml`). It builds the `messaging-service` image from the local source tree.
- Quick start or CI where you don't need to build locally: use the hub compose (`docker/docker-compose.hub.yml`) which pulls the published image `haithammubarak/messaging-platform:messaging-service` ([haithammubarak/messaging-platform:messaging-service](https://hub.docker.com/repository/docker/haithammubarak/messaging-platform/tags/messaging-service)).

Using the published Docker Hub image (no Gradle)

If you prefer to run docker compose directly and use the published messaging-service image (no build):

Windows (cmd.exe):

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml up -d --pull --no-build
```

To run in the foreground and stream logs:

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml up --pull --no-build
```

Stop and remove containers + volumes:

```bat
cd /d C:\Users\admin\dev\messaging-platform\docker
docker compose -f docker-compose.hub.yml down -v
```

Notes about the published image
- Image name: `haithammubarak/messaging-platform:messaging-service`.
- The published image contains the built `messaging-service` JAR and is maintained by the project owner.
- Using the hub image is faster for demos and CI, but you won't be testing local code changes to the `services/messaging-service` module.

Troubleshooting tips
- If ports are already in use, stop conflicting services or change the ports in `docker/docker-compose.yml`.
- On Windows, ensure Docker Desktop is running and that WSL2 integration or Hyper-V is configured (depending on your Docker setup).
- If you make changes to the Java service and want to run them via Gradle helper, run:

```bat
cd /d C:\Users\admin\dev\messaging-platform
gradlew.bat messagingServiceUp
```

This will build the JAR and bring up the repo compose stack.
