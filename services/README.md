# Messaging Services

Services act as the relay layer between agents. They never decrypt messages — only forward encrypted events.

This `services/README.md` is the canonical services documentation. It contains a dedicated section for the Messaging Service (Java/Spring Boot).

---

## ✅ Messaging Service (Java / Spring Boot)

The Messaging Service is the active relay implementation for the Messaging API. It exposes REST endpoints under `/messaging-platform/api/v1/messaging-service` and forwards encrypted events between agents without decrypting content.

Endpoints (base)
- `POST /messaging-platform/api/v1/messaging-service/connect`
- `POST /messaging-platform/api/v1/messaging-service/list-agents`
- `POST /messaging-platform/api/v1/messaging-service/receive`
- `POST /messaging-platform/api/v1/messaging-service/event`
- `POST /messaging-platform/api/v1/messaging-service/disconnect`

Web Agent UI served as static resources:
- `/messaging-platform/web-agent/index.html`

Quick start (developer)
From the repository root on Windows CMD:

```bat
cd /d C:\Users\admin\dev\messaging-platform
gradlew.bat :services:messaging-service:bootRun
```

Docker note
- For local development and integration testing you can run the full compose stack from `../docker/` (recommended). See `../docker/README.md` for details.
- A pre-built messaging service image is published on Docker Hub: `haithammubarak/messaging-platform:messaging-service`. Use the compose override pattern in `docker/README.md` if you prefer to pull the pre-built image instead of building locally.

Build the service artifact (skip tests):

```bat
gradlew.bat :services:messaging-service:clean :services:messaging-service:build -x test
```

Configuration
Runtime configuration lives in:
- `services/messaging-service/src/main/resources/application.properties`

Key areas
- `spring.redis.*` and `spring.session.*` for Redis-backed session/cache.
- `messaging.cache.*` properties (constructor-bound via `CacheProperties`).
- `udp.listener.port` for the UDP bridge.

Notes
- Agents default base URL: `http://localhost:8080/messaging-platform/api/v1/messaging-service`.
- Web Agent resources are copied into the service on build and served from classpath.
- The service integrates with Redis for sessions and includes scaffolding for Kafka-based behavior.

Troubleshooting & tips
- If you need to run the service in Docker, use the `docker/` compose stack (see `docker/README.md`).
- If the Docker image build expects pre-built artifacts, run the build task above so the JAR and resources are present under `services/messaging-service/build/`.

---

(Per your instruction, README files under `services/messaging-service/` are now merged into this canonical `services/README.md`. The original subfolder files have been replaced with pointers.)
