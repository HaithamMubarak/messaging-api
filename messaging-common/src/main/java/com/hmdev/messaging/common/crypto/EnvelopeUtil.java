package com.hmdev.messaging.common.crypto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.NamedParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility for creating and unwrapping envelopes using X25519 (ephemeral) + HKDF + AES-GCM.
 * Shared in messaging-common for agent SDKs.
 *
 * NOTE: This class also exposes simple RSA helpers for the REQUEST_PASSWORD flow examples
 * which use RSA public-key encryption to protect short secrets (channel passwords).
 */
public class EnvelopeUtil {
    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64D = Base64.getUrlDecoder();
    private static final String HKDF_INFO = "channel-envelope";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // Generate an X25519 key pair
    public static KeyPair generateX25519KeyPair() throws GeneralSecurityException {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("X25519");
        kpg.initialize(new NamedParameterSpec("X25519"));
        return kpg.generateKeyPair();
    }

    // Encode public key to base64 (X.509 encoding)
    public static String encodePublicKey(PublicKey pub) {
        return B64.encodeToString(pub.getEncoded());
    }

    // Decode a base64-encoded X25519 public key (X.509)
    public static PublicKey decodePublicKey(String b64) throws GeneralSecurityException {
        byte[] data = B64D.decode(b64);
        KeyFactory kf = KeyFactory.getInstance("X25519");
        return kf.generatePublic(new X509EncodedKeySpec(data));
    }

    // RSA-specific helpers (for simple REQUEST_PASSWORD examples)
    public static KeyPair generateRSAKeyPair() throws GeneralSecurityException {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        return kpg.generateKeyPair();
    }

    public static String encodeRSAPublicKey(PublicKey pub) {
        return B64.encodeToString(pub.getEncoded());
    }

    public static PublicKey decodeRSAPublicKey(String b64) throws GeneralSecurityException {
        byte[] data = B64D.decode(b64);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(new X509EncodedKeySpec(data));
    }

    public static byte[] rsaEncrypt(PublicKey pub, byte[] plaintext) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, pub);
        return cipher.doFinal(plaintext);
    }

    public static byte[] rsaDecrypt(PrivateKey priv, byte[] ciphertext) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.DECRYPT_MODE, priv);
        return cipher.doFinal(ciphertext);
    }

    // Create an envelope JSON string encrypting plaintext bytes for recipientPub (base64 public key)
    public static String createEnvelope(PrivateKey ephPriv, PublicKey ephPub, PublicKey recipientPub,
                                        byte[] plaintext, String channelId, String recipientName) throws Exception {
        byte[] shared = deriveSharedSecret(ephPriv, recipientPub);
        byte[] info = (HKDF_INFO + "|" + channelId + "|" + recipientName).getBytes("UTF-8");
        byte[] keyBytes = hkdfExtractAndExpand(null, shared, info, 32);
        SecretKeySpec aesKey = new SecretKeySpec(keyBytes, "AES");

        SecureRandom rnd = SecureRandom.getInstanceStrong();
        byte[] nonce = new byte[12];
        rnd.nextBytes(nonce);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, nonce);
        cipher.init(Cipher.ENCRYPT_MODE, aesKey, spec);
        byte[] aad = (channelId + "|" + recipientName).getBytes("UTF-8");
        cipher.updateAAD(aad);
        byte[] ct = cipher.doFinal(plaintext);

        ObjectNode envelope = MAPPER.createObjectNode();
        envelope.put("ephemeralPub", B64.encodeToString(ephPub.getEncoded()));
        envelope.put("nonce", B64.encodeToString(nonce));
        envelope.put("ciphertext", B64.encodeToString(ct));
        envelope.put("alg", "X25519-HKDF-SHA256-AES256GCM");

        return MAPPER.writeValueAsString(envelope);
    }

    // Unwrap envelope JSON and return plaintext bytes
    public static byte[] unwrapEnvelope(PrivateKey recipientPriv, String envelopeJson, String channelId, String recipientName) throws Exception {
        ObjectNode obj = (ObjectNode) MAPPER.readTree(envelopeJson);
        byte[] ephPubBytes = B64D.decode(obj.get("ephemeralPub").asText());
        byte[] nonce = B64D.decode(obj.get("nonce").asText());
        byte[] ct = B64D.decode(obj.get("ciphertext").asText());

        KeyFactory kf = KeyFactory.getInstance("X25519");
        PublicKey ephemeralPub = kf.generatePublic(new X509EncodedKeySpec(ephPubBytes));

        byte[] shared = deriveSharedSecret(recipientPriv, ephemeralPub);
        byte[] info = (HKDF_INFO + "|" + channelId + "|" + recipientName).getBytes("UTF-8");
        byte[] keyBytes = hkdfExtractAndExpand(null, shared, info, 32);
        SecretKeySpec aesKey = new SecretKeySpec(keyBytes, "AES");

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, nonce);
        cipher.init(Cipher.DECRYPT_MODE, aesKey, spec);
        byte[] aad = (channelId + "|" + recipientName).getBytes("UTF-8");
        cipher.updateAAD(aad);
        byte[] plain = cipher.doFinal(ct);
        return plain;
    }

    private static byte[] deriveSharedSecret(PrivateKey priv, PublicKey pub) throws Exception {
        KeyAgreement ka = KeyAgreement.getInstance("X25519");
        ka.init(priv);
        ka.doPhase(pub, true);
        return ka.generateSecret();
    }

    // HKDF-Extract and Expand (HMAC-SHA256)
    private static byte[] hkdfExtractAndExpand(byte[] salt, byte[] ikm, byte[] info, int length) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        if (salt == null || salt.length == 0) {
            salt = new byte[32];
        }
        SecretKeySpec saltKey = new SecretKeySpec(salt, "HmacSHA256");
        mac.init(saltKey);
        byte[] prk = mac.doFinal(ikm);

        mac.init(new SecretKeySpec(prk, "HmacSHA256"));
        byte[] result = new byte[length];
        byte[] t = new byte[0];
        int loc = 0;
        byte counter = 1;
        while (loc < length) {
            mac.update(t);
            if (info != null) mac.update(info);
            mac.update(counter);
            t = mac.doFinal();
            int chunk = Math.min(t.length, length - loc);
            System.arraycopy(t, 0, result, loc, chunk);
            loc += chunk;
            counter++;
        }
        return result;
    }

}
