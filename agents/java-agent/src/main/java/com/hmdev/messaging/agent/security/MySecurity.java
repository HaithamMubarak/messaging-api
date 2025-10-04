package com.hmdev.messaging.agent.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.Objects;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;

import com.hmdev.messaging.agent.security.aes.AesCtr;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

public final class MySecurity {
    private MySecurity() { /* no instances */ }

    private static final Logger logger = LoggerFactory.getLogger(MySecurity.class);

    public static String encryptAndSign(String message, String key) {
        JSONObject $myObj = new JSONObject("{}");
        $myObj.put("cipher", encrypt(message, key));
        $myObj.put("hash", hash(message, key));
        return $myObj.toString();
    }

    public static String decryptAndVerify(String cipherMsgStr, String key) {

        try {
            JSONObject $cipherMsg = new JSONObject(cipherMsgStr);

            String message = decrypt($cipherMsg.optString("cipher"), key);

            if (!Objects.equals(hash(message, key), $cipherMsg.optString("hash"))) {
                return null;
            } else {
                return message;
            }
        } catch (Exception e) {
            logger.debug("decryptWithMd5Auth error: " + e.getMessage());
            return null;
        }

    }

    public static String encrypt(String $plain, String $key) {
        try {
            return AesCtr.encrypt($plain, $key, 128);
        } catch (Exception e) {
            logger.debug("encrypt error: " + e.getMessage());
            return "";
        }
    }

    public static String decrypt(String $cipher, String $key) {
        try {
            return AesCtr.decrypt($cipher, $key, 128);
        } catch (Exception e) {
            logger.debug("decrypt error: " + e.getMessage());
        }

        return null;

    }

    public static String deriveChannelSecret(String channelName, String password) throws Exception {
        String combined = channelName + password;
        byte[] salt = "messaging-api".getBytes(); // must match JS salt
        int iterations = 100_000;
        int keyLength = 256; // bits

        KeySpec spec = new PBEKeySpec(combined.toCharArray(), salt, iterations, keyLength);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");

        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        return Base64.getEncoder().encodeToString(keyBytes); // same format as JS
    }

    public static String blocksEncrypt(Cipher encryptor, String plain) {

        if (encryptor == null) {
            return plain;
        }
        try {
            StringBuilder cipherPayload = new StringBuilder();

            for (int i = 0; i < plain.length(); i += 200) {

                int upperLimit = i + 200;
                upperLimit = Math.min(upperLimit, plain.length());

                byte[] salted = encryptor.doFinal(plain.substring(i, upperLimit).getBytes());

                cipherPayload.append(new String(Base64.getEncoder().encode(salted)));
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
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(msg.getBytes(StandardCharsets.UTF_8));
            return toHexString(hmacBytes); // keep your existing hex converter
        } catch (Exception e) {
            logger.warn(e.getMessage());
            return null;
        }
    }

    public static String toHexString(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();

        for (byte aByte : bytes) {
            String hex = Integer.toHexString(0xFF & aByte);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }

        return hexString.toString();

    }
}