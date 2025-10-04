from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os


def _derive_key(password: str, bits: int = 128, salt: bytes = None):
    if salt is None:
        salt = b"hmdev-default-salt"
    length = bits // 8
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=length, salt=salt, iterations=100_000, backend=default_backend())
    return kdf.derive(password.encode("utf-8"))


def encrypt(plaintext: str, password: str, bits: int = 128) -> bytes:
    key = _derive_key(password, bits)
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CTR(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ct = encryptor.update(plaintext.encode("utf-8")) + encryptor.finalize()
    return iv + ct  # prepend IV


def decrypt(ciphertext: bytes, password: str, bits: int = 128) -> str:
    iv, ct = ciphertext[:16], ciphertext[16:]
    key = _derive_key(password, bits)
    cipher = Cipher(algorithms.AES(key), modes.CTR(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    pt = decryptor.update(ct) + decryptor.finalize()
    return pt.decode("utf-8")