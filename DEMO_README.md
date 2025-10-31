# Messaging Platform - Demo Branch

This is a **minimal, open-source-friendly** version of the Messaging Platform. The demo branch removes complex enterprise features to provide a lightweight proof-of-concept for basic messaging functionality.

## What's Different in Demo Branch?

### ✅ **Removed Features**

1. **No Redis Caching**
   - Redis dependency removed from build and Docker configuration
   - In-memory cache implementation replaces Redis
   - Sessions and messages are ephemeral (not persisted across restarts)

2. **No UDP Layer**
   - UDP datagram listener removed
   - No UDP port exposed in Docker
   - Simplified messaging to HTTP/WebSocket only

3. **No Gaming Server Examples**
   - Gaming server examples removed from `agents/examples/`
   - Focus on chat/messaging use cases only

4. **No TCP Server in Python Agent**
   - Local TCP server removed from Python agent
   - Agents connect directly via HTTP API

5. **Optional API Keys**
   - API key authentication is optional (demo mode uses default key)
   - No developer console or key management required
   - Simplified for quick testing and POC scenarios

6. **Simplified Docker Setup**
   - No Redis container
   - No Adminer (database admin tool)
   - No SSH gateway
   - Only core services: Kafka, PostgreSQL, Messaging Service

### ✅ **What Remains**

- ✅ Core messaging service (Spring Boot + Kafka)
- ✅ PostgreSQL for channel/metadata storage
- ✅ Web agent (browser-based chat)
- ✅ Java agent library and chat example
- ✅ Python agent library and chat example
- ✅ Channel-based messaging with encryption
- ✅ Real-time message delivery via long-polling

---

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Java 11+ (if building locally)
- Gradle (included via wrapper)

### 1. Start the Services

```bash
cd docker
docker compose up --build
```

This will start:
- **Kafka** (message broker)
- **PostgreSQL** (channel metadata)
- **Messaging Service** (on port 8082)

### 2. Access the Web Agent

Open your browser to:
```
http://localhost:8082/messaging-platform/web-agent/index.html
```

### 3. Connect to a Channel

In the web agent:
- **Channel Name**: `demo-channel`
- **Channel Password**: `demo-password`
- **Agent Name**: `user1`
- **API Key**: Leave empty (optional in demo mode)

Click **Connect** and start messaging!

### 4. Test with Multiple Agents

Open another browser tab/window and connect with a different agent name (e.g., `user2`) to see real-time messaging between agents.

---

## 📚 Examples

### Java Agent Example

From the repository root:

```bash
./gradlew :agents:examples:java-agent-chat:run --args="--channel demo-channel --password demo-password --agent-name java-agent-1"
```

### Python Agent Example

```bash
cd agents/examples/python-agent-chat
python chat_example.py \
  --url http://localhost:8082/messaging-platform/api/v1/messaging-service \
  --channel demo-channel \
  --password demo-password \
  --agent-name python-agent-1
```

---

## 🛠️ Building from Source

### Build the Messaging Service

```bash
./gradlew :services:messaging-service:build
```

### Run Tests

```bash
./gradlew test
```

---

## 📖 Architecture Overview

```
┌─────────────┐         ┌──────────────────┐         ┌──────────┐
│  Web Agent  │◄───────►│ Messaging Service│◄───────►│  Kafka   │
│  (Browser)  │   HTTP  │  (Spring Boot)   │  Produce│          │
└─────────────┘         └──────────────────┘  Consume└──────────┘
                               │                          
                               │ Metadata                 
                               ▼                          
                        ┌──────────────┐                 
                        │  PostgreSQL  │                 
                        └──────────────┘                 
```

### How It Works

1. **Connect**: Agent connects to a channel using channel name + password
2. **Channel ID**: Derived from `hash(api_key:channel_name, password)`
3. **Send Message**: Posted to Kafka topic for the channel
4. **Receive Messages**: Long-polling retrieves messages from Kafka
5. **Encryption**: End-to-end encryption using channel password (optional)

---

## 🔒 Security Notes

⚠️ **Demo Mode Limitations**:

- In-memory locks are **NOT distributed** (single instance only)
- Sessions are **ephemeral** and lost on restart
- Default API key used when none provided
- Not suitable for production use

For production deployments, see the main branch with Redis, distributed locks, and proper authentication.

---

## 🐛 Troubleshooting

### Port Conflicts

If port 8082 is already in use:
```bash
docker compose down
# Edit docker/docker-compose.yml to change port mapping
docker compose up --build
```

### Kafka Connection Issues

Wait 30-60 seconds after `docker compose up` for Kafka to fully initialize before connecting agents.

### Database Connection

Check PostgreSQL logs if connection fails:
```bash
docker compose logs postgres
```

---

## 📝 API Endpoints

### Connect to Channel
```http
POST /api/v1/messaging-service/connect
Content-Type: application/json

{
  "channelName": "demo-channel",
  "channelPassword": "demo-password",
  "agentName": "agent1"
}
```

### Send Message
```http
POST /api/v1/messaging-service/push
Content-Type: application/json

{
  "sessionId": "<session-id>",
  "from": "agent1",
  "to": "*",
  "content": "Hello, world!",
  "type": "CHAT"
}
```

### Receive Messages
```http
POST /api/v1/messaging-service/receive
Content-Type: application/json

{
  "sessionId": "<session-id>",
  "channelId": "<channel-id>",
  "globalOffset": 0,
  "limit": 10
}
```

---

## 🎯 Use Cases

Perfect for:
- ✅ Learning and experimentation
- ✅ Local development and testing
- ✅ Prototyping messaging features
- ✅ Educational demos and tutorials
- ✅ Minimal chat applications

Not suitable for:
- ❌ Production deployments
- ❌ Multi-instance/clustered setups
- ❌ Long-term message persistence
- ❌ High-availability requirements

---

## 📄 License

See [LICENSE.md](LICENSE.md) in the repository root.

---

## 🤝 Contributing

Contributions welcome! Please submit issues and pull requests to the main branch. The demo branch is periodically updated from main with features stripped out.

---

## 📧 Contact

For questions or support, see the main [README.md](README.md) for contact information.
