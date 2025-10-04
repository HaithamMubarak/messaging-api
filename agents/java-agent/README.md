# Java Agent ☕

The **Java Agent** is a standalone client that connects to the Messaging API.  

## Features
- Connects via channel name + password.
- Derives channel secret from channel + password.
- Encrypts messages with **AES (CTR)** before sending.
- Decrypts received events with channel secret.
- Uses **Logback logging**.

## Usage
```bash
./gradlew :agents:java-agent:run --args="--channel myChannel --password myPassword --agent-name myAgent"
```

You can configure:
- Base URL of the service.
- Channel name / password.
- Nickname for identification.

## Notes
- Compatible with both Web Agent and Python Agent.
- Logs are configurable via `logback.xml`.
