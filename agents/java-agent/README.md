# Java Agent

Reference agent that connects to the deployed services using an endpoint + username/password.

## Configure
Set the service base URL and credentials via env vars or a config file:

```properties
service.baseUrl=https://hmdevonline.com/services/origin-service
agent.username=alice
agent.password=********
channel.id=demo-channel
```

## Send a message
1. Encrypt payload locally (AES-CTR per current implementation).
2. POST to `messages.php` with channel + credentials.
3. Poll for peer messages and decrypt locally.

## Build
This module uses **Gradle** (not Maven). Migrate your sources under `src/main/java` with base package `com.hmdev`.

```bash
./gradlew :agents:java-agent:build
```


## Quickstart Example

A minimal example is provided at `src/main/java/com/hmdev/agent/ExampleAgent.java`:

```bash
./gradlew :agents:java-agent:run --args=''
```

> Update `BASE`, `CHANNEL`, `USERNAME`, `PASSWORD`, and replace the demo AES key.


## Example JSON Exchange

### Send Message (POST → messages.php)
Java agent POSTs with parameters:
- `channel`
- `username`
- `password`
- `payload` (Base64 ciphertext)
- `iv` (Base64 IV)

Response (JSON):
```json
{ "ok": true, "message": "stored", "id": "msg-001" }
```

### Poll Messages (GET → messages.php)
Java agent polls with query parameters: `channel`, `username`, `password`.

Response (JSON):
```json
{ "ok": true, "messages": [ { "id":"msg-001", "payload":"BASE64DATA", "iv":"BASE64IV" } ] }
```

The agent must then **decrypt** each message using AES with the provided IV.


## Parsing JSON in Java

The agent can parse JSON responses using **Gson** (already included as a dependency).

Example snippet:

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

String json = "{ \"ok\": true, \"messages\": [ { \"id\":\"msg-001\", \"payload\":\"BASE64DATA\", \"iv\":\"BASE64IV\" } ] }";

Gson gson = new Gson();
JsonObject obj = gson.fromJson(json, JsonObject.class);

if (obj.get("ok").getAsBoolean()) {
    JsonArray msgs = obj.getAsJsonArray("messages");
    for (int i = 0; i < msgs.size(); i++) {
        JsonObject m = msgs.get(i).getAsJsonObject();
        String id = m.get("id").getAsString();
        String payload = m.get("payload").getAsString();
        String iv = m.get("iv").getAsString();
        System.out.printf("Received msg %s with IV=%s\n", id, iv);
        // TODO: Base64 decode payload + iv and decrypt with AES
    }
} else {
    System.err.println("Error: " + obj.get("error").getAsString());
}
```

This lets the agent handle the JSON returned by `messages.php` consistently.
