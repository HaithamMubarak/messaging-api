import time
import base64
import json
from typing import Callable, Any, Tuple, Optional

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding


def generate_rsa_keypair(key_size: int = 2048) -> Tuple[Any, str]:
    """Generate RSA private key and return (private_key_object, public_key_pem_str).

    private_key: object from cryptography library (usable for decrypt)
    public_key_pem_str: PEM-encoded public key string
    """
    priv = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
    pub_pem = priv.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    return priv, pub_pem


def _rsa_decrypt(private_key: Any, cipher_bytes: bytes) -> bytes:
    return private_key.decrypt(
        cipher_bytes,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
    )


def wait_for_password_reply(
    agent_name: str,
    receive: Callable[[Any], Any],
    private_key: Any,
    channel_api: Any,
    connection_time: Optional[float] = None,
    expected_request_id: Optional[str] = None,
    maybe_channel_name: Optional[str] = None,
    timeout_seconds: int = 10,
    poll_interval: float = 0.4
) -> bool:
    """Polls for PASSWORD_REPLY events addressed to `agent_name` until timeout.

    Expected event shape: dict-like with keys 'type', 'to', 'content', 'date'.
    The content of the event may be either:
      - a base64 ciphertext string (direct), or
      - a JSON string containing { "requestId": <id>, "cipher": <base64> }

    Decrypted plaintext is expected to be either a plain password string, or JSON with
    { "channelName": <name>, "channelPassword": <password> }.

    On success calls channel_api.set_channel_secret(channel_name, password) if present,
    or channel_api.set_channel_password/password setter pattern if available. Returns True on success.
    """
    deadline = time.time() + float(timeout_seconds)
    while time.time() < deadline:
        # use a ReceiveConfig-like object from caller (the caller passes a lambda wrapping self.receive)
        res = receive({'globalOffset': 0, 'localOffset': None, 'limit': 20})
        if res and getattr(res, 'events', None) is not None:
            events = res.events
            for ev in events:
                try:
                    # Support both dict-like and object events
                    etype = ev.get('type') if isinstance(ev, dict) else getattr(ev, 'type', None)
                    eto = ev.get('to') if isinstance(ev, dict) else getattr(ev, 'to', None)
                    edate = ev.get('date') if isinstance(ev, dict) else getattr(ev, 'date', None)
                    if edate is None:
                        edate = 0

                    if etype != 'password-reply' or eto != agent_name:
                        continue

                    # Only accept replies newer than connection_time when provided
                    if connection_time is not None and edate <= connection_time:
                        continue

                    content = ev.get('content') if isinstance(ev, dict) else getattr(ev, 'content', None)
                    if not content:
                        continue

                    # content can be JSON wrapping requestId and cipher, or raw base64
                    cipher_b64 = None
                    try:
                        parsed = json.loads(content)
                        if isinstance(parsed, dict):
                            # If a requestId is present, it must match expected_request_id when provided
                            if 'requestId' in parsed and expected_request_id is not None and parsed.get('requestId') != expected_request_id:
                                continue
                            cipher_b64 = parsed.get('cipher') or parsed.get('content')
                    except Exception:
                        # not JSON, treat as raw base64 ciphertext
                        cipher_b64 = content

                    if not cipher_b64:
                        continue

                    cipher = base64.b64decode(cipher_b64)
                    plain = _rsa_decrypt(private_key, cipher)
                    dec = plain.decode('utf-8')

                    # plaintext may be JSON with channelName/channelPassword or a plain password
                    channel_name = None
                    channel_password = dec
                    try:
                        p = json.loads(dec)
                        if isinstance(p, dict):
                            if p.get('channelPassword'):
                                channel_password = p.get('channelPassword')
                            if p.get('channelName'):
                                channel_name = p.get('channelName')
                    except Exception:
                        pass

                    # apply the secret: prefer a setter on channel_api if available
                    try:
                        if channel_name and hasattr(channel_api, 'set_channel_secret'):
                            channel_api.set_channel_secret(channel_name, channel_password)
                        elif hasattr(channel_api, 'set_channel_password'):
                            channel_api.set_channel_password(channel_password)
                        elif hasattr(channel_api, 'channel_secret'):
                            # derive channel secret if channel name was provided
                            if channel_name and hasattr(channel_api, 'derive_channel_secret'):
                                channel_api.channel_secret = channel_api.derive_channel_secret(channel_name, channel_password)
                            else:
                                # store raw password where possible
                                try:
                                    channel_api.channel_password = channel_password
                                except Exception:
                                    pass
                    except Exception:
                        # ignore setter failures
                        pass

                    return True
                except Exception:
                    # ignore and continue waiting
                    continue
        time.sleep(poll_interval)
    return False

