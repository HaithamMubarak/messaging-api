package com.hmdev.messaging.agent.security.aes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* AES counter-mode (CTR) implementation in JavaScript                (c) Chris Veness 2005-2017  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/aes.html                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* eslint no-var:warn *//* global WorkerGlobalScope */

/**
 * AesCtr: Counter-mode (CTR) wrapper for AES.
 *
 * This encrypts a Unicode string to produces a base64 ciphertext using 128/192/256-bit AES,
 * and the converse to decrypt an encrypted ciphertext.
 *
 * See csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf
 */
public final class AesCtr extends Aes {
    private AesCtr() { /* no instances */ }

    private static final Logger logger = LoggerFactory.getLogger(AesCtr.class);
	
	public static String ENCODING = "ASCII";
    /**
     * Encrypt a text using AES encryption in Counter mode of operation.
     *
     * Unicode multi-byte character safe
     *
     * @param   {string} plaintext - Source text to be encrypted.
     * @param   {string} password - The password to use to generate a key for encryption.
     * @param   {number} nBits - Number of bits to be used in the key; 128 / 192 / 256.
     * @throws Exception 
     * @returns {string} Encrypted text.
     *
     * @example
     *   const encr = AesCtr.encrypt('big secret', 'p???????', 256); // 'lwGl66VVwVObKIr6of8HVqJr'
     */
    public static String encrypt(String plaintext, String password, int nBits) throws Exception {
        if (nBits != 128 && nBits != 192 && nBits != 256) {
            throw new IllegalArgumentException("Key size must be 128, 192, or 256 bits");
        }

        int nBytes = nBits / 8;

        // Derive key: take first nBytes chars of password (zero-padded), then AES-encrypt with itself.
        byte[] pwBytes = new byte[nBytes];
        byte[] pwInput = password.getBytes(StandardCharsets.UTF_8);
        for (int i = 0; i < nBytes; i++) {
            pwBytes[i] = (i < pwInput.length) ? pwInput[i] : 0;
        }

        // Encrypt pwBytes with AES-ECB to create key material (equivalent to Aes.cipher in JS).
        Cipher aesEcb = Cipher.getInstance("AES/ECB/NoPadding");
        SecretKeySpec pwKeySpec = new SecretKeySpec(pwBytes, "AES");
        aesEcb.init(Cipher.ENCRYPT_MODE, pwKeySpec);
        byte[] keyMaterial = aesEcb.doFinal(pwBytes);

        // Expand key to nBytes (16/24/32) by concatenating as in the JS code
        byte[] key = new byte[nBytes];
        System.arraycopy(keyMaterial, 0, key, 0, Math.min(16, nBytes));
        if (nBytes > 16) {
            System.arraycopy(keyMaterial, 0, key, 16, nBytes - 16);
        }

        // Build 16-byte counter block:
        // [0-1] = ms, [2-3] = random, [4-7] = sec, [8-15] = counter (start at 0)
        ByteBuffer counterBlock = ByteBuffer.allocate(16);
        long now = System.currentTimeMillis();
        int nonceMs = (int) (now % 1000);
        int nonceSec = (int) (now / 1000);
        int nonceRnd = new SecureRandom().nextInt(0x10000);

        counterBlock.put((byte) (nonceMs & 0xff));
        counterBlock.put((byte) ((nonceMs >>> 8) & 0xff));
        counterBlock.put((byte) (nonceRnd & 0xff));
        counterBlock.put((byte) ((nonceRnd >>> 8) & 0xff));
        counterBlock.put((byte) (nonceSec & 0xff));
        counterBlock.put((byte) ((nonceSec >>> 8) & 0xff));
        counterBlock.put((byte) ((nonceSec >>> 16) & 0xff));
        counterBlock.put((byte) ((nonceSec >>> 24) & 0xff));
        // leave last 8 bytes zero for counter

        byte[] iv = counterBlock.array();

        Cipher cipher = Cipher.getInstance("AES/CTR/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new IvParameterSpec(iv));
        byte[] cipherBytes = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

        // Prepend the first 8 bytes of the counter block (the nonce) to ciphertext
        byte[] result = new byte[8 + cipherBytes.length];
        System.arraycopy(iv, 0, result, 0, 8);
        System.arraycopy(cipherBytes, 0, result, 8, cipherBytes.length);

        return Base64.getEncoder().encodeToString(result);
    }
    /**
     * Decrypt a text encrypted by AES in counter mode of operation
     *
     * @param   {string} ciphertext - Cipher text to be decrypted.
     * @param   {string} password - Password to use to generate a key for decryption.
     * @param   {number} nBits - Number of bits to be used in the key; 128 / 192 / 256.
     * @throws Exception 
     * @returns {string} Decrypted text
     *
     * @example
     *   const decr = AesCtr.decrypt('lwGl66VVwVObKIr6of8HVqJr', 'p???????', 256); // 'big secret'
     */
    public static String decrypt(String ciphertextBase64, String password, int nBits) throws Exception {
        final int blockSize = 16;  // 16 bytes = 128 bits

        if (!(nBits == 128 || nBits == 192 || nBits == 256)) {
            throw new IllegalArgumentException("Key size is not 128 / 192 / 256");
        }

        // decode base64
        byte[] ciphertextBytes = Base64.getDecoder().decode(ciphertextBase64);
        // UTF‑8 bytes of password
        byte[] pwBytesRaw = password.getBytes(StandardCharsets.UTF_8);

        int nBytes = nBits / 8;  // number of bytes in key
        byte[] pwBytes = new byte[nBytes];
        for (int i = 0; i < nBytes; i++) {
            if (i < pwBytesRaw.length) {
                pwBytes[i] = pwBytesRaw[i];
            } else {
                pwBytes[i] = 0;
            }
        }

        // Derive "key" = AES(pwBytes) expanded to length nBytes
        byte[] firstKey = aesBlockEncrypt(pwBytes, pwBytes);
        // Note: In JS version, they do Aes.cipher(pwBytes, keyExpansion(pwBytes))
        // The equivalent here depends on your AES implementation.
        // Then they concat repeated to fill nBytes:
        byte[] key = new byte[nBytes];
        System.arraycopy(firstKey, 0, key, 0, firstKey.length);
        if (nBytes > firstKey.length) {
            System.arraycopy(firstKey, 0, key, firstKey.length, nBytes - firstKey.length);
        }

        // Extract nonce from first 8 bytes of ciphertext
        byte[] counterBlock = new byte[16];
        System.arraycopy(ciphertextBytes, 0, counterBlock, 0, 8);

        // Prepare key schedule / cipher for CTR mode
        // Here we use "AES in ECB mode" to encrypt the counter block for each block
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        Cipher aesECB = Cipher.getInstance("AES/ECB/NoPadding");
        aesECB.init(Cipher.ENCRYPT_MODE, keySpec);

        // Compute number of blocks
        int ciphertextLen = ciphertextBytes.length;
        int nBlocks = (int) Math.ceil((ciphertextLen - 8) / (double) blockSize);

        byte[] plaintextBytes = new byte[ciphertextLen - 8];
        int plainOffset = 0;

        for (int b = 0; b < nBlocks; b++) {
            // Set counter in the last 8 bytes of counterBlock
            long blockIndex = b;
            // lower 4 bytes
            for (int c = 0; c < 4; c++) {
                counterBlock[15 - c] = (byte) ((blockIndex >>> (c * 8)) & 0xFF);
            }
            // upper 4 bytes (if needed)
            long hi = (blockIndex >>> 32);
            for (int c = 0; c < 4; c++) {
                counterBlock[15 - 4 - c] = (byte) ((hi >>> (c * 8)) & 0xFF);
            }

            // Encrypt counter block
            byte[] cipherCntr = aesECB.doFinal(counterBlock);

            // XOR with ciphertext block
            int blockStart = 8 + b * blockSize;
            int blockLen = Math.min(blockSize, ciphertextLen - blockStart);
            for (int i = 0; i < blockLen; i++) {
                plaintextBytes[plainOffset + i] = (byte) (cipherCntr[i] ^ ciphertextBytes[blockStart + i]);
            }
            plainOffset += blockLen;
        }

        // Convert plaintextBytes (UTF8) back to String
        return new String(plaintextBytes, StandardCharsets.UTF_8);
    }

    /**
     * A placeholder AES block encryption function: encrypt one block (16 bytes) with AES ECB.
     * You may replace this with your library’s AES encryption call. Here, key is used for both key
     * and data just for demonstration (mimics JS Aes.cipher(pwBytes, keyExpansion(pwBytes))).
     */
    private static byte[] aesBlockEncrypt(byte[] block, byte[] key) throws Exception {
        if (block.length != 16) {
            // pad or error as appropriate
            byte[] tmp = new byte[16];
            System.arraycopy(block, 0, tmp, 0, Math.min(block.length, 16));
            block = tmp;
        }
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        Cipher aesECB = Cipher.getInstance("AES/ECB/NoPadding");
        aesECB.init(Cipher.ENCRYPT_MODE, keySpec);
        return aesECB.doFinal(block);
    }


    static String utf8Encode(String str) throws UnsupportedEncodingException {
    	return URLDecoder.decode(URLEncoder.encode(str, "UTF-8"), "UTF-8") ;
    }
    /**
     * Decodes utf8 string to multi-byte.
     * @throws UnsupportedEncodingException 
     */
    static String utf8Decode(String str) throws UnsupportedEncodingException {
    	return URLDecoder.decode(URLEncoder.encode(str, "UTF-8"), "UTF-8") ;
    }
  
    
    public static void main(String[] args){
    
    	try {
    		
//    		String bin = new String(new char[]{18,2,156,242,171,162,77,89,118,53,2,68,206,19,162});
////    		Base64.getMimeEncoder().encode(src)
//    		logger.debug(bin.codePointAt(0));
//    		logger.debug(bin.codePointAt(1));
//    		logger.debug(bin.codePointAt(2));
//    		logger.debug(bin.codePointAt(3));
//
//    		logger.debug( new String(Base64.getEncoder().encode(bin.getBytes(ENCODING))));
//  
//    		
    		
    		String msg = "hi man=";
    		
    		String salted = AesCtr.encrypt(msg,"a",128);
    		logger.debug(salted);
    		String plain = AesCtr.decrypt(salted,"a",128);
    		logger.debug(plain);

		} catch (Exception e) {
			logger.error("Unexpected error", e);
		}

    }
}