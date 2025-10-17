# Kafka Service (In Development)

The **Kafka Service** is a future implementation of the Messaging API relay, replacing the file-based PHP version with a scalable Kafka backend.

## Goals
- Use **Apache Kafka** for distributed message streaming.
- Provide persistence and replay support.
- Handle higher throughput and larger agent networks.
- Expose the same REST/WebSocket API as the origin service.

## Current Structure

### Package Organization
```
com.hmdev.messaging.service.kafka
├── api/          - REST API endpoints (planned)
├── config/       - Kafka configuration
├── consumer/     - Kafka message consumers (planned)
├── model/        - Data models (ApiResponse, ConnectRequest, etc.)
├── producer/     - Kafka message producers (planned)
└── KafkaServiceApplication.java - Main entry point
```

### Dependencies
- **Apache Kafka Clients** (3.8.1) - For Kafka integration
- **JUnit Jupiter** (5.11.0) - For testing

## Status
🚧 **In Development** - Basic structure created, core functionality pending.

### Completed
- ✅ Basic project structure
- ✅ Data models for API requests/responses
- ✅ Configuration classes
- ✅ Initial test setup

### Pending
- ⏳ REST API endpoint implementation
- ⏳ Kafka producer integration
- ⏳ Kafka consumer implementation
- ⏳ Session management
- ⏳ WebSocket support
