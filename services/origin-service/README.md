# Origin Polling Service

This is the HTTP polling relay used by agents to exchange messages across networks. It persists **encrypted** channel data on disk using a folder hierarchy.

> Folder: `services/origin-service/`

## Endpoints (from source analysis)

- **index.php**  
  - params: action, data, mime, no-encryption, user  
  - file ops: file_exists, file_put_contents, fopen, fread, fwrite, mkdir, scandir, unlink  
  - crypto: yes
- **invitation.php**  
  - params: —  
  - file ops: —  
  - crypto: yes
- **lock.php**  
  - params: type  
  - file ops: fopen  
  - crypto: no
- **messages.php**  
  - params: —  
  - file ops: file_exists, fread, fwrite, unlink  
  - crypto: no
- **public_key.php**  
  - params: —  
  - file ops: —  
  - crypto: no
- **sleep.php**  
  - params: —  
  - file ops: —  
  - crypto: no
- **aes/aes.class.php**  
  - params: —  
  - file ops: —  
  - crypto: yes
- **aes/aesctr.class.php**  
  - params: —  
  - file ops: —  
  - crypto: yes

### Behavioral Notes

- Channels are represented as directories on disk. Files within a channel store encrypted messages and state.
- Concurrency is coordinated via simple lock files (`lock.php`).
- AES-CTR routines are included under `aes/` (client/agent also performs encryption before sending).

## Example Workflow

1. Client/agent authenticates with **channel id** + **username/password** (see `index.php`).
2. Agent **encrypts** payload using its key (AES-CTR).
3. Agent `POST`s ciphertext to `messages.php`.
4. Peer polls with `GET` to retrieve pending ciphertext.
5. Agent decrypts locally; service never sees plaintext.

> Use **HTTPS** in production to prevent metadata leakage. Sanitize all inputs server-side.

## Deploy

- Copy contents of this folder to your PHP-capable web server (Apache/Nginx + PHP-FPM).
- Ensure the service has write permission to its **data root** (channel directories).
- Verify `open_basedir` and path handling to prevent directory traversal.

## Security Recommendations

- Validate and normalize all inbound path segments (channel IDs, usernames).
- Consider rotating per-channel salts/IVs and using authenticated encryption (AES-GCM) in newer agents.
- Rate-limit polling endpoints to mitigate abuse.
- Serve behind HTTPS; deny directory listing.


## Optional Bootstrap (Hardening)

You can include `bootstrap.php` at the top of each endpoint to get:
- Input validation (IDs limited to `[A-Za-z0-9._-]{1,64}`)
- Safe path joining inside a fixed data root
- Owner-only file permissions

Example:

```php
<?php
require_once __DIR__ . '/bootstrap.php';
$channel = safe_id($_POST['channel'] ?? $_GET['channel'] ?? '');
// ...
```


## JSON Responses

Include `json_response.php` and replace `echo` with:

```php
require_once __DIR__ . '/json_response.php';

// On success
json_ok(['message' => 'stored', 'id' => $msgId]);

// On error
json_error('invalid input', 400);
```

All endpoints should respond with `application/json` for consistency.
