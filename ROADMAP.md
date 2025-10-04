# 🗺️ Roadmap

The **Messaging API** started as a Chrome extension signaling system for WebRTC screen sharing.
It has since evolved into a **secure, multi-language messaging backbone** — with agents in **Web, Java, and Python**.

This document outlines the future directions and planned use cases.

---

## ✅ Current State (Demo Release)

- **Origin Service** (Apache + PHP) as a secure relay.
- **End-to-End Encryption** using PBKDF2 → AES-CTR → SHA256 integrity.
- **Multi-language agents** (Web, Java, Python).
- **Dockerized setup** for quick start.
- **Demo workflow**: Web agent + Java/Python agents exchanging secure messages.

---

## 🟢 Short-Term Goals

### 🔹 Secure Chat & File Sharing
- Encrypted text chat (already functional).
- Extend to **encrypted file transfer** (Base64 / chunked streams).

### 🔹 WebRTC Signaling
- Use channels for exchanging **SDP offers/answers** and **ICE candidates**.
- Enable peer-to-peer audio/video or data channels without extra signaling servers.

### 🔹 Game Signaling
- Relay encrypted game moves/state updates between players.
- Lightweight multiplayer experiments with Web/Python/Java agents.

---

## 🟡 Mid-Term Goals

### 🔹 Machine Monitoring & Management
- Agents running on servers/IoT devices.
- Send metrics, logs, and status updates.
- Secure command/control channel from dashboards.

### 🔹 Chatbots & Automation
- Python/Java agents acting as bots.
- Respond to messages, perform tasks, integrate AI/ML.

### 🔹 Node Collaboration
- Multiple agents (nodes) coordinating work.
- Distributed task execution, workload sharing, or voting.
- Foundation for **distributed computing demos**.

---

## 🔵 Long-Term Goals

### 🔹 Scalable Backend
- Kafka-based service for high-throughput messaging.
- Replication & partitioning for reliability.

### 🔹 Real-Time Transport
- **WebSockets** for low-latency communication.
- Long-polling fallback for environments without WebSockets.

### 🔹 IoT Swarms
- Manage fleets of IoT devices with secure channels.
- Remote updates and telemetry collection.

### 🔹 Collaborative Applications
- Shared whiteboards, document editing, dashboards.
- Encrypted, multi-user real-time apps.

### 🔹 Integration Layer
- Bridge between enterprise systems (Java), AI/automation services (Python), and Web dashboards.
- Allow hybrid environments to collaborate securely.

---

## 🌟 Vision

The **Messaging API** aims to become a **general-purpose secure messaging framework**:

- Lightweight alternative to heavy brokers (Kafka, RabbitMQ) for small/medium workloads.
- Cross-language interoperability out-of-the-box.
- Extensible with custom event types for new domains.
- Built with **security-first design** (end-to-end encryption, no plaintext relay).

**One API, multiple agents, infinite applications.**
