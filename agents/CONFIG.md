# Agents + Service Shared Configuration

This document explains the single-source-of-truth setup for developer defaults used by agents, the messaging service, and the web agent UI.

Goals
- Use a single variable name for the default developer API key across Java, Python, and the web-agent (`DEFAULT_API_KEY`).
- Use a single variable name for admin email (`ADMIN_EMAIL`).
- Ensure the messaging service, Java and Python agents, and the web UI read the same value at runtime.

Where to set values
- For Docker Compose runs: set `DEFAULT_API_KEY` and `ADMIN_EMAIL` as environment variables that docker-compose can read. The project `docker/docker-compose.yml` now references these placeholders as `${DEFAULT_API_KEY}` and `${ADMIN_EMAIL}`.
- For local runs:
  - Java examples: pass `--api-key` to the example (it will set `System.setProperty("DEFAULT_API_KEY", ...)`) or set `DEFAULT_API_KEY` in your shell.
  - Python examples: pass `--api-key` to the example or set `DEFAULT_API_KEY` env var in the shell.
  - Web Agent: if served by `messaging-service`, the service exposes `/messaging-platform/generated/web-agent/default-key.js` which sets `window.__DEFAULT_API_KEY` so the client reads the same value.

How each component reads the value
- `messaging-service` (Spring Boot): `DataInitializer` uses the Spring property `messaging.init.admin.keyId` or falls back to `${DEFAULT_API_KEY}` (see property placeholder). The `WebAgentConfigController` serves the runtime JS based on the same property.
- `Java agents` (agent entrypoints / `AgentConnection`): Agent entrypoints (examples or the long-running `Agent` service) should load the developer API key from an environment variable (`DEFAULT_API_KEY`) or from a CLI argument (`--api-key`). They then pass the API key into the agent factory/constructor which attaches it to HTTP requests; the `MessagingChannelApi` implementation no longer reads environment variables directly.
- `Python agents` (agent entrypoints / `AgentConnection.with_api_key`): Agent entrypoints should load the developer API key from `DEFAULT_API_KEY` env var or `--api-key` CLI argument and pass it to `AgentConnection.with_api_key(...)` (or to the `ConnectionChannelApiFactory`) so the `HttpClient` will include `X-Api-Key`. The `HttpClient` implementation no longer reads `DEFAULT_API_KEY` from `os.environ` by itself.
- `Web Agent` (static UI): The page loads `/messaging-platform/generated/web-agent/default-key.js` which sets `window.__DEFAULT_API_KEY`; the page then uses that to prefill the API key input and to send `X-Api-Key` from the client library.

Security note
- These defaults should only be used for local development and demos. Avoid storing real secrets in source control. For production, use a proper secrets manager and do not place keys in Compose YAML or environment variables on shared machines.

Examples
- Docker Compose environment (example, run in your host shell before `docker-compose up`):

```cmd
set DEFAULT_API_KEY=c9b1c8f2-3a5b-4f2a-8d2b-1234567890ab
set ADMIN_EMAIL=admin@hmdevonline.com
cd docker
docker-compose up -d
```

- Java example with CLI override:
```cmd
gradlew.bat :agents:examples:java-agent-chat:run --args="--channel=system001 --password=12345678 --agent-name=java-example --api-key=c9b1c8f2-..."
```

- Python example with CLI override:
```cmd
python chat_example.py --api-key c9b1c8f2-... --url http://localhost:8082/messaging-platform/api/v1/messaging-service
```
