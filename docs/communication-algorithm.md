# Communication Algorithm

This document explains how the **Messaging API communication flow** works in detail.

---

## 1. Agent Initialization
Each agent (Web, Java, Python) starts with:
- `channelName`
- `channelPassword`
- `nickName`

The agent derives a **channel secret key** from `(channelName + channelPassword)` using **AES in CTR mode** combined with hashing.

---

## 2. Connect to Service
The agent sends a `connect` request to the Messaging API service.

Example payload:
```json
{
  "channelName": "system001",
  "channelPassword": "hash(password)",
  "agentName": "web-agent-001",
  "agentContext": {
    "agentType": "WEB-AGENT",
    "descriptor": "Browser/Device Info"
  }
}
```

- If the channel does not exist → the server creates it.  
- The agent is assigned a `sessionId`.  
- All agents with same channel credentials are logically connected.

---

## 3. Message Sending
The sending agent:
1. Encrypts message payload with derived AES-CTR key.  
2. Computes an **HMAC-SHA256** for message integrity and authenticity.  
   This prevents tampering and ensures that only agents with the shared channel key can generate valid messages.
3. Wraps into an event object.

Example:
```json
{
  "type": "chat-text",
  "encrypted": true,
  "content": {
    "cipher": "UAM8dkFs32hyQg==",
    "hash": "444bcb3a3fcf8389296c49467f27e1d6..."
  },
  "from": "web-agent-001",
  "date": 1690000000000
}
```

The server relays this event to other connected agents. It cannot decrypt the content.

---

## 4. Message Receiving
Receiving agents:
1. Decrypt the payload using the same AES-CTR channel key.  
2. Verify the **hash** matches the decrypted plaintext.  
3. Deliver plaintext message to the application.  

If hash verification fails → the message is discarded as tampered.

---

## 5. Event Types
- `connect` → a new agent joins.  
- `disconnect` → an agent leaves.  
- `chat-text` → encrypted chat message between agents.  
- (future) system/control events for advanced features.  

---

## 6. Security Model
- ✅ **End-to-end encryption** with AES-CTR.  
- ✅ **Integrity verification** using HMAC-SHA256.  
- ✅ **Server is blind relay** (no plaintext access).  
- ✅ **Transport security** ensured with HTTPS.  

---
