import base64
import time
import os
from Crypto.Cipher import AES


class AesCtr:
    @staticmethod
    def encrypt(plaintext: str, password: str, n_bits: int) -> str:
        if n_bits not in (128, 192, 256):
            raise ValueError("Key size must be 128, 192, or 256 bits")

        n_bytes = n_bits // 8

        # Zero-padded password bytes
        pw_input = password.encode("utf-8")
        pw_bytes = bytearray(n_bytes)
        for i in range(n_bytes):
            pw_bytes[i] = pw_input[i] if i < len(pw_input) else 0

        # AES-ECB encrypt pwBytes with itself
        aes_ecb = AES.new(bytes(pw_bytes), AES.MODE_ECB)
        key_material = aes_ecb.encrypt(bytes(pw_bytes))

        # Expand key
        key = bytearray(n_bytes)
        key[:min(16, n_bytes)] = key_material[:min(16, n_bytes)]
        if n_bytes > 16:
            key[16:] = key_material[: n_bytes - 16]

        # Counter block (16 bytes)
        now = int(time.time() * 1000)
        nonce_ms = now % 1000
        nonce_sec = now // 1000
        nonce_rnd = int.from_bytes(os.urandom(2), "little")

        iv = bytearray(16)
        iv[0] = nonce_ms & 0xff
        iv[1] = (nonce_ms >> 8) & 0xff
        iv[2] = nonce_rnd & 0xff
        iv[3] = (nonce_rnd >> 8) & 0xff
        iv[4] = nonce_sec & 0xff
        iv[5] = (nonce_sec >> 8) & 0xff
        iv[6] = (nonce_sec >> 16) & 0xff
        iv[7] = (nonce_sec >> 24) & 0xff
        # last 8 bytes = 0 for counter

        cipher = AES.new(bytes(key), AES.MODE_CTR, nonce=bytes(iv[:8]))
        cipher_bytes = cipher.encrypt(plaintext.encode("utf-8"))

        # prepend first 8 bytes (nonce)
        result = iv[:8] + cipher_bytes
        return base64.b64encode(result).decode("utf-8")

    @staticmethod
    def decrypt(ciphertext_b64: str, password: str, n_bits: int) -> str:
        if n_bits not in (128, 192, 256):
            raise ValueError("Key size must be 128, 192, or 256 bits")

        data = base64.b64decode(ciphertext_b64)

        # Zero-padded password bytes
        pw_input = password.encode("utf-8")
        n_bytes = n_bits // 8
        pw_bytes = bytearray(n_bytes)
        for i in range(n_bytes):
            pw_bytes[i] = pw_input[i] if i < len(pw_input) else 0

        # Derive key
        aes_ecb = AES.new(bytes(pw_bytes), AES.MODE_ECB)
        first_key = aes_ecb.encrypt(bytes(pw_bytes))

        key = bytearray(n_bytes)
        key[: len(first_key)] = first_key
        if n_bytes > len(first_key):
            key[len(first_key):] = first_key[: n_bytes - len(first_key)]

        # extract nonce
        nonce = data[:8]
        cipher_bytes = data[8:]

        cipher = AES.new(bytes(key), AES.MODE_CTR, nonce=nonce)
        plaintext = cipher.decrypt(cipher_bytes)
        return plaintext.decode("utf-8")


if __name__ == "__main__":
    msg = "hi man="
    salted = AesCtr.encrypt(msg, "a", 128)
    print("Encrypted:", salted)
    plain = AesCtr.decrypt(salted, "a", 128)
    print("Decrypted:", plain)
