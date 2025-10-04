# Messaging API

The **Messaging API** is a lightweight, agent-driven messaging platform enabling secure peer-to-peer communication through a relay service.  
It supports **Web, Java, and Python agents** with **end-to-end encryption (AES-CTR)**.

---

## 🚀 Overview

### Core Idea
- Secure **agent-to-agent** messaging.  
- Server acts only as a **relay** (no decryption).  
- Encryption key derived from **channelName + channelPassword**.

### Supported Agents
- 🌐 Web Agent  
- ☕ Java Agent  
- 🐍 Python Agent  

### Current Status
- ✅ Working prototype with **Origin Service**.  
- ✅ Agents implemented (Web, Java, Python).  
- ⚙️ Future: **Kafka backend** & WebSocket support.  

---

## 🏗 Architecture

### Services
- **Origin Service** → PHP relay (current).  
- **Kafka Service** → planned scalable backend.  

### Flow
```
[ Agent A ] <-- encrypted --> [ Messaging API Relay ] <-- encrypted --> [ Agent B ]
```

---

## 🔐 Security Model

- **End-to-End Encryption** → Messages are encrypted with AES-CTR using a key derived from `(channelName + channelPassword)`.
- **Integrity Protection** → Each message includes a SHA-256 hash to verify data integrity.
- **Zero Knowledge Relay** → The server only relays events and never has access to plaintext message content.
- **Transport Security** → HTTPS is used to secure communication between agents and the relay.
- **Future Option** → In environments without HTTPS, an API option will be introduced to support public/private relay servers with enhanced key handling.

---

## 📦 Dependencies
- [JSEncrypt v2.3.1](https://github.com/travist/jsencrypt) → RSA key encryption.  
- [Video.js](https://videojs.com/) + [videojs-contrib-hls](https://github.com/videojs/videojs-contrib-hls) → adaptive streaming.  
- AES JavaScript libraries (AES-CTR, AES.js, Base64.js) → symmetric encryption helpers.  
- [Emojify.js](https://github.com/Ranks/emojify.js) → emoji rendering.  

See [THIRD_PARTY.md](./THIRD_PARTY.md) for license details.

---

## 📖 Documentation

- [Communication Algorithm](./docs/communication-algorithm.md)  
- [Service Requests & Responses](./docs/examples.md)  
- [Agents Guide](./agents/README.md)  
- [Services Guide](./services/README.md)  

---
## 🐳 Docker & Gradle Tasks

### Build Overview
The project uses **Gradle tasks** to simplify container management.  
This avoids typing long `docker build` / `docker run` commands and ensures a repeatable environment for running the **Origin Service**.

Currently, automation is provided for the **Origin Service** (the relay server).  
Once the container is running, agents such as the **Web Agent** can connect and start exchanging encrypted messages.

---

### 🔹 Origin Service

The **Origin Service Docker image** is built from `docker/Dockerfile.origin-service`.  
It is based on a lightweight **Apache + PHP** environment and contains:

- **Messaging API Origin Service PHP code** → `/var/www/html/messaging-api/origin-service`
- **Channels directory** → mounted volume for storing channel/session data:
  ```
  /root/data/messaging-api/origin-service/channels
  ```
  This directory is created on the host during container startup and mounted into the container.
- **API endpoints** served via Apache:
    - `/origin-service?action=connect`
    - `/origin-service?action=active-agents`
    - `/origin-service?action=receive`
    - `/origin-service?action=event`
    - `/origin-service?action=disconnect`

The server acts only as a **relay**. It cannot decrypt messages (end-to-end encryption is enforced between agents).

Once running, the service will be available at:  
**http://localhost:8080/messaging-api/origin-service**

Web-Agent page will be available at:  
**http://localhost:8080/messaging-api/web-agent/index.html**

---

### 🚀 Run Using Prebuilt Docker Image

You can quickly start the Origin Service using the prebuilt Docker image from Docker Hub.

#### Simple run (no persistence)
```bash
docker pull haithammubarak/messaging-api:origin-service
docker run -d -p 8080:80 haithammubarak/messaging-api:origin-service
```

#### Run with mounted folder (persistent channels)
```bash
mkdir -p ./data/origin-service/channels
sudo chmod 777 ./data/origin-service/channels
docker run -d -p 8080:80 \
  --name origin-service \
  -v $(pwd)/data/origin-service/channels:/var/www/html/messaging-api/origin-service/channels \
  haithammubarak/messaging-api:origin-service
```

Origin Service → http://localhost:8080/messaging-api/origin-service

Web Agent UI → http://localhost:8080/messaging-api/web-agent/index.html

👉 Docker Hub: https://hub.docker.com/r/haithammubarak/messaging-api

### Build Workflow (Origin Service + Web Agent)

#### Option 1: Manual Setup (No Docker/Gradle)

1. 🔗 Install **Apache + PHP** on your server (Linux recommended).  
   Example (Debian/Ubuntu):
   ```bash
   sudo apt update
   sudo apt install apache2 php libapache2-mod-php
   ```

2. Copy the **Origin Service PHP code** into your web root:
   ```bash
   sudo mkdir -p /var/www/html/messaging-api/origin-service/
   sudo cp -r services/origin-service/* /var/www/html/messaging-api/origin-service/
   ```

3. Copy the **Web Agent** files:
   ```bash
   sudo mkdir -p /var/www/html/messaging-api/web-agent
   sudo cp -r agents/web-agent/* /var/www/html/messaging-api/web-agent/
   ```

4. Create the channels directory:
   ```bash
   sudo mkdir -p /var/www/html/messaging-api/origin-service/channels
   sudo chmod -R 775 /var/www/html/messaging-api/origin-service/channels
   sudo chown -R www-data:www-data /var/www/html/messaging-api/origin-service/channels
   ```

5. Restart Apache:
   ```bash
   sudo systemctl restart apache2
   ```
---

#### 🔗 Option 2: Gradle/Docker Automation

1. **Build & Run the Origin Service**
   ```bash
   ./gradlew originServiceUp
   ```
    - Builds the Docker image from `docker/Dockerfile.origin-service`.
    - Launches a container named `origin-service`.
    - Prepares the `channels` directory on the host and mounts it.

2. **Open the Web Agent**
    - Open `/messaging-api/web-agent/index.html` in your browser.
    - Enter channel name, password, and nickname.
    - Connect → messages are now relayed through the Origin Service.

---

### Other Tasks

- **Build only**
  ```bash
  ./gradlew originServiceBuild
  ```
  Creates/updates the Docker image (`messaging-api:origin-service`) without running it.

- **Run only**
  ```bash
  ./gradlew originServiceRun
  ```
  Starts the container from the existing image. Removes old instance if present.

- **Stop**
  ```bash
  ./gradlew originServiceStop
  ```
  Stops and removes the container, leaving the image intact.


### Example Workflow (Origin Service + Web Agent)

1. **Build & Run the Origin Service**
   ```bash
   ./gradlew originServiceUp
   ```
    - Builds the Docker image from `docker/Dockerfile.origin-service`.
    - Launches a container named `origin-service`.
    - Prepares the `channels` directory on the host and mounts it.

2. **Open the Web Agent**
    - Open `/messaging-api/web-agent/index.html` in your browser.
    - Enter channel name, password, and nickname.
    - Connect → messages are now relayed through the Origin Service.

### 🚀 Demo Access

#### 🔗 Origin Service (Relay API)
The service endpoints are available at:
- Local: **http://localhost/messaging-api/origin-service**
- Domain (Playground): **https://hmdevonline.com/messaging-api/origin-service**

---

#### 💻 Web Agent UI (Browser Client)
The Web Agent demo page is available at:
- Local: **http://localhost/messaging-api/web-agent/index.html**
- Domain (Playground): **https://hmdevonline.com/messaging-api/web-agent/index.html**

---

### 🧪 How to Try It Out

1. **Choose a Channel**
    - Channel Name (e.g., `system001`)
    - Channel Password (e.g., `12345678`)
    - These values are used by all agents to derive the same **channel secret key**.

2. **Pick a Unique Agent Name**
    - Each agent must use a **unique `agentName` / nickname** (e.g., `web-agent-001`, `python-bot`, `java-client1`).
    - If two agents use the same name in the same channel, conflicts may occur.

3. **Connect with the Web Agent**
    - Open the Web Agent UI (link above).
    - Enter **channel name**, **password**, and a unique **nickname**.
    - Click **Connect** → the agent joins the channel.
    - 👉 You can simulate multiple agents by:
        - Opening two browser windows or tabs.
        - Using different browsers.
        - Opening an **incognito/private window**.
        - Connecting from a **mobile device**.
        - Connecting from **another machine** on the network.

4. **Connect with the Python Agent**
    - See [Python Agent README](./agents/python-agent/README.md).
    - Example:
      ```bash
      cd agents/python-agent
      python -m hmdev.messaging.agent.main --channel system001 --password 12345678 --agent-name python-agent-001
      ```

5. **Connect with the Java Agent**
    - See [Java Agent README](./agents/java-agent/README.md).
    - Example:
      ```bash
      ./gradlew :agents:java-agent:run --args="--channel system001 --password 12345678 --agent-name java-agent-001"
      ```

6. **Exchange Messages**
    - Agents in the same channel can now exchange **end-to-end encrypted messages**.
    - The Origin Service relays messages but **cannot decrypt them**.

---

## 🔮 Roadmap
- WebSocket support.  
- Kafka backend integration.  
- Metadata exchange via AgentContext.  
- Docker Compose for full system.  

---

## 🤝 Contributing

Contributions are welcome! 🎉  
Guidelines and contribution details will be published as the project grows.

For now, feel free to explore the code, open issues, or share feedback to help shape the roadmap.

---

## 📜 Project History
Originally started in **2017** as [Quick Chrome Share Tool](https://bitbucket.org/haithammubarak/quick_chrome_share/src/master/chrome-quick-share-tool/).  
Migrated and restructured in **2025** as **Messaging API**.
