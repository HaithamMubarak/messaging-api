# Messaging Services

Services act as the relay layer between agents.  
They **never decrypt** messages — only forward encrypted events.

---

## 🟢 Origin Service
- Current relay implementation (PHP/Apache).  
- Provides endpoints for:
  - `connect`  
  - `list-agents`  
  - `receive`  
  - `event`  
  - `disconnect`  

See [docs/examples.md](../docs/examples.md) for detailed request/response examples.

---

## 🔮 Kafka Service (Planned)
- Future implementation of the relay service using **Apache Kafka**.  
- Aims to provide scalability, high throughput, and distributed messaging.  

- More information and developer notes: `services/kafka-service/README.md`
- Quick notes:
  - Status: Planned / in-progress
  - Uses Redis for session/cache integration (see `messaging.cache.*` properties in the kafka-service README)
  - Intended to preserve the existing Messaging API surface so agents need minimal changes

---
