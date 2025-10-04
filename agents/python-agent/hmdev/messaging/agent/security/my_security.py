import base64
import hmac, hashlib
import json
import logging

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

from hmdev.messaging.agent.security.aes_ctr import AesCtr

logger = logging.getLogger(__name__)


class MySecurity:
    """Static-like utility class for encryption, signing, and verification."""

    def __init__(self):
        raise RuntimeError("No instances allowed")

    @staticmethod
    def encrypt_and_sign(message: str, key: str) -> str:
        data = {
            "cipher": MySecurity.encrypt(message, key),
            "hash": MySecurity.hash(message, key),
        }
        return json.dumps(data)

    @staticmethod
    def decrypt_and_verify(cipher_msg_str: str, key: str) -> str | None:
        try:
            cipher_msg = json.loads(cipher_msg_str)
            message = MySecurity.decrypt(cipher_msg.get("cipher", ""), key)

            if message is None:
                return None

            if MySecurity.hash(message, key).strip() != cipher_msg.get("hash", "").strip():
                return None
            return message
        except Exception as e:
            logger.debug(f"decrypt_with_md5_auth error: {e}")
            return None

    # ------------------ AES CTR helper ------------------

    @staticmethod
    def encrypt(plain: str, key: str) -> str:
        try:
            return AesCtr.encrypt(plain, key, 128)
        except Exception as e:
            logger.debug(f"encrypt error: {e}")
            return ""

    @staticmethod
    def decrypt(cipher: str, key: str) -> str | None:
        try:
            return AesCtr.decrypt(cipher, key, 128)
        except Exception as e:
            logger.debug(f"decrypt error: {e}")
            return None

    # ------------------ Key derivation ------------------

    @staticmethod
    def derive_channel_secret(channel_name: str, password: str) -> str:
        combined = (channel_name + password).encode()
        salt = b"messaging-api"  # must match JS
        iterations = 100_000
        key_length = 32  # 256 bits

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=key_length,
            salt=salt,
            iterations=iterations,
            backend=default_backend(),
        )
        key_bytes = kdf.derive(combined)
        return base64.b64encode(key_bytes).decode()

    # ------------------ MD5 Hash ------------------

    @staticmethod
    def hash(msg: str, key_str: str) -> str:
        try:
            # return hashlib.sha256(msg.encode("utf-8")).hexdigest()
            return hmac.new(key_str.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256).hexdigest()
        except Exception as e:
            logger.warning(f"hash error: {e}")
            return None
