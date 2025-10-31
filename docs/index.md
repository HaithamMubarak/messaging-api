# Messaging API Documentation

See communication-algorithm.md and examples.md.

## Channel API naming
The generic channel API is named `MessagingChannelApi` (formerly `HTTPChannelApi`). It abstracts HTTP operations and UDP bridge helpers for low-latency usage. Old imports of `HTTPChannelApi` remain available (alias) on Python for backward compatibility.

## UDP bridge
- Default UDP port: 9999
- If the HTTP base URL includes a port, that port is used for UDP by default.
- Overrides:
  - Java: system property `-Dmessaging.udp.port=12345` or env `MESSAGING_UDP_PORT=12345`
  - Python: env `MESSAGING_UDP_PORT=12345` or constructor `MessagingChannelApi(remote_url, udp_port=12345)`

See agents READMEs for code examples.
