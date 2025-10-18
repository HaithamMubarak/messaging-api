# Kafka Service

The **Kafka Service** is the planned, scalable relay implementation for the Messaging API that will replace the current PHP-based origin service. It is designed to use Apache Kafka for distributed message streaming while keeping the same external API surface (REST/WebSocket endpoints) used by existing agents.

---

## Goals
- Use **Apache Kafka** for reliable, distributed message streaming and replay.
- Improve throughput, durability and scalability compared to the current file-based relay.
- Preserve the existing Messaging API endpoints so agents can migrate with minimal changes.
- Provide pluggable session and cache storage (Redis is used by the current implementation for session/cache support).

---

## Status
🚧 Planned / in-progress

This module contains scaffolding and supporting components (Redis-backed session/cache helpers and configuration). The full Kafka relay implementation (consumers, producers, routing and persistence) is planned but not yet implemented.

---

## Quick start (developer)
1. Configure the application properties (see the Configuration section below).
2. From the repository root run the kafka-service module (requires Gradle and a configured Redis/Kafka if you want full runtime behavior):

```bat
cd /d C:\Users\admin\dev\messaging-api
gradlew.bat :services:kafka-service:bootRun
```

To build the kafka-service artifact without running tests:

```bat
cd /d C:\Users\admin\dev\messaging-api
gradlew.bat :services:kafka-service:clean :services:kafka-service:build -x test
```

Notes:
- If your environment does not have a module-level Gradle wrapper jar, use the root wrapper (shown above).
- For local development you may run a local Redis instance (or Docker container) to exercise session/cache features.

---

## Configuration
All runtime configuration is provided via `services/kafka-service/src/main/resources/application.properties` or environment variables.

Important properties (placeholders are present in the repo):

- Redis / Spring Session
  - `spring.session.store-type=redis`
  - `spring.redis.host` (default: `localhost`)
  - `spring.redis.port` (default: `6379`)
  - `spring.redis.password` (if set)

- Messaging cache (`messaging.cache.*`) — bound to `com.hmdev.messaging.service.kafka.cache.CacheProperties`
  - `messaging.cache.session-prefix` (default: `session:`)
  - `messaging.cache.session-ttl-seconds` (default: `1800`)
  - `messaging.cache.kafka-msg-prefix` (default: `kafka_msg:`)
  - `messaging.cache.kafka-message-ttl-seconds` (default: `300`)
  - `messaging.cache.channel-sessions-prefix` (default: `channel_session:`)
  - `messaging.cache.kafka-message-max-count` (default: `100`)

Environment variables map by replacing `.` with `_` and uppercasing. Example:
- `MESSAGING_CACHE_SESSION_PREFIX` → sets `messaging.cache.session-prefix`

The repository `application.properties` already contains documented placeholders and examples — change them per environment.

---

## Development notes
- `CacheProperties` is constructor-bound and exposed via Spring's `@EnableConfigurationProperties` so configuration is read-only at runtime and safe to inject.
- The project includes a Redis-backed `CacheService` implementation (`RedisCacheService`) and session manager (`RedisSessionManager`) used by the service components.
- When the Kafka relay is implemented, it should interact with the cache/session layer using the `CacheService` interface so storage implementation remains pluggable.

---

## Useful links
- API examples and algorithm: `docs/examples.md`, `docs/communication-algorithm.md`
- Web agent (demo UI): `agents/web-agent`

---

## How to help
If you want to contribute the Kafka relay implementation, consider the following tasks:
- Define Kafka topic layout and message schema for events and control messages.
- Implement consumer/producer components and routing to the existing REST/WebSocket API contracts.
- Add end-to-end integration tests that run against Dockerized Kafka and Redis instances.

Thank you — contributions welcome.
