# Hardening Notes

These suggestions improve robustness without changing core behavior:

1. **Input normalization**
   - Enforce strict regex on `channel`, `username`, `password` (e.g., `^[A-Za-z0-9._-]{1,64}$`).
   - Reject unexpected characters; normalize to lowercase if applicable.

2. **Path safety**
   - Resolve any derived filesystem path with `realpath()` and verify it remains inside the configured data root.
   - Disable directory listing on the server.

3. **Authenticated Encryption**
   - Prefer AES-GCM on the **agent side** (encrypt-then-MAC). For backward compatibility, keep AES-CTR but add a MAC (HMAC-SHA256) over `(iv || ciphertext)`.

4. **Transport security**
   - Serve only over **HTTPS**; redirect HTTP→HTTPS.

5. **Rate limiting & locks**
   - Apply simple token-bucket per channel/IP (e.g., via Redis or file tokens) to throttle abusive polling.
   - Keep lock files short-lived; ensure stale locks are cleaned.

6. **Consistent JSON API**
   - Respond with `application/json` for both success and errors; avoid echoing raw input values.

7. **Permissions**
   - `umask(0077)` before writing files; verify directory permissions (owner-only).

8. **Logging**
   - Log minimal metadata; never log secrets or plaintext payloads.
