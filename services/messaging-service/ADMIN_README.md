Messaging Service — Admin Console

Overview
--------
This document summarizes the admin/debugging console shipped with the messaging-service. The admin console is a static page served from:

  services/messaging-service/src/main/resources/static/admin/index.html

It provides quick administrative tasks: list channels, view channel details, view and page messages (from cache or runtime/Kafka), stream live events, list and disconnect agents, remove channels, and audit logging for deletes.

Key features
------------
- List channels and click a channel to select it.
- View channel details: event counts and connected agents.
- View messages with server-side paging: offset + limit. Source can be either Cache (fast) or Runtime (Kafka) using the "Source" dropdown.
- Stream live events via Server-Sent Events (SSE). SSE also accepts the selected source.
- Disconnect agents by sessionId or by agent name (bulk).
- Remove a channel (by channelId or by channel name + password); optional Kafka topic deletion. Removes cache data and logs the delete to audit.
- Reset the per-channel counter.
- Export messages or audit logs from the UI.

Important endpoints
-------------------
Base path: /messaging-platform/api/v1/messaging-service/admin

- GET /channels
  - List known channel ids with event counts.
- GET /channels/{channelId}
  - Get channel details and connected agents.
- GET /channels/{channelId}/messages?offset={n}&limit={m}&source={cache|runtime}
  - Page messages. Default source=cache. When source=runtime the server attempts to read messages directly from Kafka.
- GET /channels/{channelId}/stream?pollMs={ms}&source={cache|runtime}&token={adminToken}
  - SSE stream of recent messages. Pass token as query param when using EventSource (or set X-Admin-Token header).
- GET /channels/{channelId}/agents
  - List agents (sessionInfo included).
- GET /channels/{channelId}/agents/{sessionId}
  - Session details for a specific session.
- POST /channels/{channelId}/disconnect-agent
  - Body: { "sessionId": "..." } or { "agentName": "..." }
  - Disconnects and removes session(s) from cache.
- POST /remove
  - Body: { "channelId": "..." } or { "channelName": "...", "channelPassword": "...", "deleteTopic": true }
  - Removes all cache entries for the channel; optionally tries to delete the Kafka topic. Deletes are recorded in the audit log.
- POST /reset-counter
  - Body: { "channelId": "..." }
  - Resets the per-channel local offset counter.
- GET /audit?limit={n}
  - Read the last N audit log entries (deletes are logged here).

Authentication
--------------
Admin endpoints are protected by either:
- A configured admin token (set via `messaging.admin.token`) accepted in header `X-Admin-Token` or as `token` query parameter for SSE, or
- Basic auth with a configured user (any authenticated principal accepted if `messaging.admin.user` is set).
If neither are configured, admin endpoints are open (not recommended for production).

Notes & caveats
---------------
- Cache mode reads recent messages from the cache (fast).
- Runtime mode attempts to read directly from Kafka using the message service consumer pool. Runtime reads are heavier and rely on messages containing a per-channel `otherProperties.localOffset` (this is added by the sending path). Runtime pagination is best-effort and may not return exact global offsets.
- SSE deduplication is simple and used for short-term duplication prevention.

How to run
----------
From the repo root (Windows cmd):

```bat
cd C:\Users\admin\dev\messaging-platform
gradlew.bat :services:messaging-service:bootRun
```

Open the admin console in your browser:
- /admin or /admin/index.html
- or /messaging-platform/admin (redirects to the packaged admin index)

If your server is behind a reverse proxy or different context path, adjust the UI `base` variable in `index.html` accordingly.

Next steps and recommended improvements
-------------------------------------
- Improve runtime paging to support global-offset based reads if precise ordering is required.
- Add a nicer message detail modal with pretty-printed JSON and raw view toggle.
- Improve SSE deduplication using message unique ids or local offsets.
- Harden rate-limiting for runtime reads to protect Kafka under heavy admin queries.

If you want, I can add the README to another location, add examples of curl commands with authentication, or implement any of the suggested improvements now.
