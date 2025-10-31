REQUEST_PASSWORD / PASSWORD_REPLY — Agent-only flow (design)

Overview
--------
This document defines the design for the REQUEST_PASSWORD → PASSWORD_REPLY flow that is implemented entirely on the agent (client) side and/or in a separate developer-owned domain-server. The Messaging-Service (core) is explicitly NOT responsible for persisting, inspecting, or relaying password-request envelopes beyond its role as a generic message relay (Kafka) and session manager.

Goals
-----
- Allow agents to request a channel password when they don't know it.
- Ensure the channel password is revealed only to the requesting agent and is encrypted using the requester's public key (RSA is recommended for the simple request/reply examples).
- Keep the Messaging-Service out of password exchange storage/processing for privacy and separation-of-concerns.
- Provide a clear agent-domain protocol that developers can implement (and which example code demonstrates).

Key actors
----------
- Requester agent: generates an RSA public/private key pair (long-term or ephemeral per-device). The agent sends a `REQUEST_PASSWORD` EventMessage containing its RSA public key (base64).
- Initiator agent (or domain-server/owner): holds or obtains the channel password and replies with a `PASSWORD_REPLY` — an encrypted blob (ciphertext) containing the password, encrypted to the requester's RSA public key.
- Domain-server (developer-owned): optional stateless poller/bridge that consumes request events off the messaging pipeline (or receives them via other channels) and triggers a reply by encrypting the password for the requester. This domain-server is a developer process and is NOT part of the Messaging-Service runtime.
- Messaging-Service: relays EventMessage objects via Kafka and manages sessions in Redis. It does NOT persist or attempt to decrypt password envelopes, nor should it provide special server-side logic for REQUEST_PASSWORD/PASSWORD_REPLY beyond normal message relay.

Message shapes (agent-level)
---------------------------
- REQUEST_PASSWORD EventMessage (sent by requester as a chat/event message)
  {
    "from": "RequesterName",
    "to": "*" | "InitiatorAgentName",
    "type": "password-request",
    "encrypted": false,
    "content": "<base64-rsa-public-key>",
    "date": 169xxxxxxx
  }

- PASSWORD_REPLY EventMessage (sent by initiator/domain; content carries the encrypted ciphertext)
  {
    "from": "InitiatorName" | "domain-server",
    "to": "RequesterName",
    "type": "password-reply",
    "encrypted": false,
    "content": "<base64(ciphertext)>",
    "date": 169xxxxxxx
  }

Processing & responsibilities
-----------------------------
- Requester agent:
  - Generates (or uses) an RSA public/private keypair. The public key is base64-encoded and placed into the `content` field of a `REQUEST_PASSWORD` EventMessage and sent via the existing messaging APIs. The key identifies the requester.
  - Polls or listens to the message stream and looks for `PASSWORD_REPLY` addressed to itself.
  - When receiving a `PASSWORD_REPLY`, decodes base64 `content` to the ciphertext bytes, then calls the agent-side RSA unwrap utility (e.g. `EnvelopeUtil.rsaDecrypt()`) with its private key to recover the channel password.
  - Uses the recovered channel password to compute/derive the channelId and then connects.

- Initiator agent / Domain-server (developer-owned):
  - Receives or watches for `REQUEST_PASSWORD` events (via Kafka or via developer-owned bridge). It extracts the requester's RSA public key (from the event content).
  - Encrypts the channel password with the requester's RSA public key (e.g. `EnvelopeUtil.rsaEncrypt()`), base64-encodes the ciphertext, and places it in the `content` field of a `PASSWORD_REPLY` EventMessage addressed to the requester.
  - Sends the `PASSWORD_REPLY` event via the existing messaging path so it will be relayed to recipients. Note: sending the reply via the messaging pipeline is optional — any secure transport owned by the developer may be used.

- Messaging-Service (server):
  - No special handling of REQUEST_PASSWORD or PASSWORD_REPLY — these are regular EventMessage objects. The core should not attempt to persist, decrypt, or treat these message types as privileged. Any developer-owned domain-server that polls/mutates envelope queues is external to the Messaging-Service binary/process.

Security considerations
----------------------
- Confidentiality: channel password content is encrypted to the requester's public key by the initiator/domain — only the requester can decrypt.
- Authentication and replay:
  - Agents should authenticate their requests (e.g., include a sessionId proven to the server) to reduce spoofing risk; the Messaging-Service can validate sessions but must not read or persist request/reply payloads.
  - Envelopes and ciphertexts should include a timestamp and nonce where appropriate. Agents should reject old or unexpected replies beyond a small time window to mitigate replay.
- Key lifecycle: agents should provide a mechanism to rotate/revoke keys. The design assumes the requester private key used for unwrap is available securely on the device.
- Transport: all server communication must use TLS. Developer domain-server should authenticate with Messaging-Service using developer API keys when interacting with messaging APIs.

Operational notes
-----------------
- Because the server doesn't persist envelopes, offline delivery depends on the normal messaging pipeline (Kafka retention and agent polling). If you need guaranteed offline delivery, implement a separate envelope-service or allow initiators to store the encrypted reply in developer-owned storage.
- Logging: Do not log sensitive fields; redact or log only metadata.

Testing
-------
- Unit tests: agent-side utils for RSA encrypt/decrypt and optional envelope helper tests (happy path + tamper/failure cases).
- Integration test (recommended): start a test messaging service with a local Kafka, create two agent test clients (requester and initiator), send REQUEST_PASSWORD via requester, have initiator produce PASSWORD_REPLY, verify requester decrypts and recovers password. The initiator/domain-server in this test is a separate developer process, not part of the Messaging-Service itself.

Summary
-------
- The REQUEST_PASSWORD / PASSWORD_REPLY exchange is fully agent/domain responsibility and should be implemented by agents or developer-owned services.
- Messaging-Service is a relay and session manager only and does not persist or process password contents.
- Use the `EnvelopeUtil` helpers (in `messaging-common`) to implement RSA-based encrypt/decrypt in agent and domain code (examples updated accordingly).

If you'd like, I can move the example classes into a dedicated `examples/agent` folder and add runnable Gradle application targets for them, or produce an integration test harness that verifies the full agent-only flow using an embedded Kafka.
