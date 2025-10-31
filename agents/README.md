# Messaging Agents

Agents are client-side programs that connect to the Messaging Service. This folder contains multiple agent implementations and examples.

Canonical documentation (this file) and per-agent sections are below:
- Root README: `../README.md`
- Services: `../services/README.md`
- Docker/dev: `../docker/README.md`

---

## Web Agent (browser UI)

The Web Agent is a browser-based interface for the Messaging API. It provides a simple chat-like UI for testing channels and interacting with other agents.

Quick usage
- Open `agents/web-agent/index.html` in your browser (or serve the folder via a local HTTP server).
- Provide connection details (channel name or `channelId`, password or `apiKey`) and click Connect.

Docker note
- For local end-to-end testing you can run the full compose stack from the repository `docker/` folder (recommended). See `../docker/README.md` for details.
- If you don't want to build the Messaging Service locally, a pre-built image is available on Docker Hub: `haithammubarak/messaging-platform:messaging-service`. Use the compose override pattern in `docker/README.md` to run the stack with the Hub image instead of building locally.

Key features
- Supports channel name + password, API key via header, or `channelId`-based auth.
- Messages are encrypted client-side when using channel password.
- Exposes a `window.HTTPChannel` constructor for embedding in other pages.

Connecting examples (summary)
- Channel name + password: derive the secret locally, then call `connect()`.
- Channel name + API key: supply `apiKey` and optional `apiKeyHeaderName`.
- channelId + API key: use `channelId` to avoid exposing channel name/password.

Notes
- When `apiKey` is provided the agent includes it in all requests. If `channelPassword` is used, the agent derives the channel secret and uses it for encryption.

---

## Java Agent

The Java Agent is a client library and runnable example for connecting to the Messaging Service.

Features
- Derives channel secret from channel name + password and uses AES-CTR for payload encryption.
- Supports HTTP-based messaging operations (send, receive, connect, disconnect).
- Configurable base URL, logging (Logback), and API key authentication.

**Note**: TCP/UDP server support has been removed. Use the AgentConnection API directly in your application code.

Quick run (example)
From the repository root:

```
gradlew.bat :agents:examples:java-agent-chat:run --args="--channel=system001 --password=12345678 --agent-name=java-agent-example-001"
```

---

## Python Agent

The Python Agent package provides a lightweight scripting client for the Messaging Service.

**Note**: TCP/UDP server support has been removed. Use the AgentConnection API directly in your application code.

Quick run (example)

```
cd /d C:\Users\admin\dev\messaging-platform\agents\examples\python-agent-chat
python chat_example.py --url http://localhost:8082/messaging-platform/api/v1/messaging-service --channel system001 --password 12345678 --agent-name python-agent-example-001
```

---

## Examples

This repository contains runnable examples demonstrating agent behavior:
- Java chat demo: `agents/examples/java-agent-chat`
- Python chat demo: `agents/examples/python-agent-chat`

Example notes
- The Python example uses a local path reference to the `python-agent` folder in `requirements.txt` for development installs.
- The Java example accepts an `--api-key` argument to include a developer API key in requests.

---

## Selenium tests (automation)

There is a pytest-based Selenium test suite in `agents/selenium-tests` for automating basic connect flows and simple integration checks. Quick run:

```
cd agents/selenium-tests
python -m pytest -q
```

Prerequisites
- Python 3.8+
- Install test dependencies (`requirements.txt`) and a browser driver (e.g. `chromedriver`) on PATH.
- Messaging service reachable (tests assume local defaults, or adjust environment variables).

---

## Developer notes & where to look
- For service URLs and run instructions see the root `README.md` and `services/README.md`.
- For Docker-based local setup and SSH tunnel helpers see `docker/README.md`.

(This `agents/README.md` is now the canonical agents index; per-project READMEs in agent subfolders have been merged into this file and replaced with pointers.)
