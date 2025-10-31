package com.hmdev.messaging.common.security;

import com.hmdev.messaging.common.security.aes.AesCtr;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

public final class MySecurity {
    private static final Logger logger = LoggerFactory.getLogger(MySecurity.class);

    private static final byte[] PBKDF2_SALT = "messaging-platform".getBytes(StandardCharsets.UTF_8);
    private static final int PBKDF2_ITERATIONS = 100_000;
    private static final int PBKDF2_KEY_LENGTH = 256; // bits
    private static final SecretKeyFactory PBKDF2_FACTORY;
    private static final Base64.Encoder B64_URL_NO_PADDING = Base64.getUrlEncoder().withoutPadding();

    // Performance-oriented shared resources
    private static final Base64.Encoder B64 = Base64.getEncoder();
    private static final ThreadLocal<Mac> MAC_THREAD_LOCAL = ThreadLocal.withInitial(() -> {
        try {
            return Mac.getInstance("HmacSHA256");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    });
    private static final char[] HEX_ARRAY = "0123456789abcdef".toCharArray();

    // Small cache to avoid recreating SecretKeySpec objects for the same key strings
    private static final ConcurrentHashMap<String, SecretKeySpec> KEY_SPEC_CACHE = new ConcurrentHashMap<>();

    static {
        try {
            PBKDF2_FACTORY = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        } catch (NoSuchAlgorithmException exception) {
            throw new RuntimeException(exception);
        }
    }

    private MySecurity() { /* no instances */ }

    public static String encryptAndSign(String message, String key) {
        JSONObject $myObj = new JSONObject("{}");
        $myObj.put("cipher", encrypt(message, key));
        $myObj.put("hash", hash(message, key));
        return $myObj.toString();
    }

    public static String decryptAndVerify(String cipherMsgStr, String key) {
        try {
            JSONObject cipherMsg = new JSONObject(cipherMsgStr);
            String message = decrypt(cipherMsg.optString("cipher"), key);
            if (!Objects.equals(hash(message, key), cipherMsg.optString("hash"))) {
                return null;
            } else {
                return message;
            }
        } catch (Exception e) {
            logger.debug("decryptWithMd5Auth error: {}", e.getMessage());
            return null;
        }
    }

    public static String encrypt(String $plain, String $key) {
        try {
            return AesCtr.encrypt($plain, $key, 128);
        } catch (Exception e) {
            logger.debug("encrypt error: {}", e.getMessage());
            return "";
        }
    }

    public static String decrypt(String $cipher, String $key) {
        try {
            return AesCtr.decrypt($cipher, $key, 128);
        } catch (Exception e) {
            logger.debug("decrypt error: {}", e.getMessage());
        }
        return null;
    }

    public static String deriveChannelSecret(String channelName, String password) {
        String combined = channelName + password;
        KeySpec spec = new PBEKeySpec(combined.toCharArray(), PBKDF2_SALT, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH);
        try {
            byte[] keyBytes = PBKDF2_FACTORY.generateSecret(spec).getEncoded();
            return "channel_" + B64_URL_NO_PADDING.encodeToString(keyBytes);
        } catch (InvalidKeySpecException e) {
            throw new RuntimeException("Key derivation failed", e);
        }
    }

    public static String blocksEncrypt(Cipher encryptor, String plain) {
        if (encryptor == null) {
            return plain;
        }
        try {
            // Work on UTF-8 bytes once to avoid repeated substring allocations
            byte[] plainBytes = plain.getBytes(StandardCharsets.UTF_8);
            StringBuilder cipherPayload = new StringBuilder((plainBytes.length/200 + 1) * 24);
            for (int i = 0; i < plainBytes.length; i += 200) {
                int upperLimit = Math.min(i + 200, plainBytes.length);
                int len = upperLimit - i;
                // avoid allocating a temporary chunk array by using the doFinal overload
                byte[] salted = encryptor.doFinal(plainBytes, i, len);
                cipherPayload.append(B64.encodeToString(salted));
            }
            return cipherPayload.toString();
        } catch (Exception e) {
            logger.warn(e.getMessage());
            return "";
        }
    }

    public static String hash(String msg, String key) {
        if (msg == null || key == null) {
            return null;
        }
        try {
            Mac mac = MAC_THREAD_LOCAL.get();
            // cache SecretKeySpec to avoid recreating the object for frequently used keys
            SecretKeySpec secretKeySpec = KEY_SPEC_CACHE.computeIfAbsent(key, k ->
                    new SecretKeySpec(k.getBytes(StandardCharsets.UTF_8), "HmacSHA256")
            );
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(msg.getBytes(StandardCharsets.UTF_8));
            return toHexString(hmacBytes); // keep your existing hex converter
        } catch (Exception e) {
            logger.warn(e.getMessage());
            return null;
        }
    }

    public static String toHexString(byte[] bytes) {
        // faster hex conversion, fewer allocations than StringBuilder+Integer.toHexString
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars);
    }
}