# JavaScript Agent

This is a browser-based agent with multiple pages and components that communicate with the **origin-service**.

## Files / Structure
- `index.php` — main entry point for browser agent
- `console.html` — console-style interface
- `rtc.html` — experimental RTC interface
- `filesystem.php` — helper for file explorer component
- `css/` — shared styles
- `images/` — icons, emoji, and UI assets
- `html5-components/` — reusable widgets (file explorer, level bar, etc.)

## Communication with origin-service
The JS agent sends and receives messages through the endpoints in **services/origin-service**:

- `index.php` — channel creation/management (entry point)
- `messages.php` — send & poll for messages
- `invitation.php` — invitation workflow
- `lock.php` — concurrency
- `public_key.php` — key exchange

### Response Format
All endpoints are expected to return **JSON**:

```json
{ "ok": true, "message": "stored", "id": "123" }
```
or on error:
```json
{ "ok": false, "error": "invalid input" }
```

Ensure `json_response.php` is included at the top of each PHP endpoint.

## Running
1. Deploy `agents/web-agent/` and `services/origin-service/` together on a PHP-enabled web server.
2. Open `index.php` or `console.html` in your browser.
3. Configure channel, username, and password.
4. Send/receive messages using the UI.

## Notes
- The UI includes emoji, chat-style message view, and file explorer widget.
- To align with encryption model, replace demo payload handling with AES encryption/decryption in JS (see `aes.class.php` for reference).


## Example JSON Exchange

### Send Message (POST → messages.php)
Request:
```http
POST /services/origin-service/messages.php
Content-Type: application/x-www-form-urlencoded

channel=demo-channel&username=alice&password=alice-pass&payload=BASE64DATA&iv=BASE64IV
```

Response:
```json
{ "ok": true, "message": "stored", "id": "msg-001" }
```

### Poll Messages (GET → messages.php)
Request:
```http
GET /services/origin-service/messages.php?channel=demo-channel&username=alice&password=alice-pass
```

Response:
```json
{ "ok": true, "messages": [ { "id":"msg-001", "payload":"BASE64DATA", "iv":"BASE64IV" } ] }
```
