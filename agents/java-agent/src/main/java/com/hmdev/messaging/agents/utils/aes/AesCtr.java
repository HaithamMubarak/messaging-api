package com.hmdev.messaging.agents.utils.aes;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
public class AesCtr extends Aes {
	
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
        int blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(nBits==128 || nBits==192 || nBits==256)) throw new Exception("Key size is not 128 / 192 / 256");
       
        plaintext = AesCtr.utf8Encode(new String(plaintext));
        password = AesCtr.utf8Encode(new String(password));
        
        // use AES itself to encrypt password to get cipher key (using plain password as source for key
        // expansion) to give us well encrypted key (in real use hashed password could be used for key)
        int nBytes = nBits/8;  // no bytes in key (16/24/32)
        int[] pwBytes = new int[nBytes];
        for (int i=0; i<nBytes; i++) {  // use 1st 16/24/32 chars of password for key
            pwBytes[i] = i<password.length() ?  (int)password.codePointAt(i) : 0;
        }
        int[] key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes)); // gives us 16-byte key
        
        int[] newArr = new int[key.length+nBytes-16];
        for(int i=0;i<key.length;i++){
        	newArr[i] = key[i];
        }        
        for(int i=key.length;i<newArr.length;i++){
        	newArr[i] = key[i - key.length];
        }  
        key = newArr;  
        
//        key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long
	
        // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A �B.2): [0-1] = millisec,
        // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
        int[] counterBlock = new int[blockSize];
        long nonce = System.currentTimeMillis();  // timestamp: milliseconds since 1-Jan-1970
        long nonceMs = nonce%1000;
        long nonceSec = (long) Math.floor(1.0*nonce/1000);
        long nonceRnd = (long) Math.floor(Math.random()*0xffff);
        // for debugging: nonce = nonceMs = nonceSec = nonceRnd = 0;
        for (int i=0; i<2; i++) counterBlock[i]   = (int) ((nonceMs  >>> i*8) & 0xff);
        for (int i=0; i<2; i++) counterBlock[i+2] = (int) ((nonceRnd >>> i*8) & 0xff);
        for (int i=0; i<4; i++) counterBlock[i+4] = (int) ((nonceSec >>> i*8) & 0xff);
        // and convert it to a string to go on the front of the ciphertext

	   String ctrTxt = "";
        for (int i=0; i<8; i++) ctrTxt += (char)(counterBlock[i]);
			
        // generate key schedule - an expansion of the key into distinct Key Rounds for each round
        int[][] keySchedule = Aes.keyExpansion(key);
        int blockCount = (int) Math.ceil(1.0 * plaintext.length()/blockSize);
        String ciphertext = "";
        
         for (int b=0; b<blockCount; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
            for (int c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
            for (int c=0; c<4; c++) counterBlock[15-c-4] = ((int)(1.0*((long)b)/0x100000000L) >>> c*8);
            int[] cipherCntr = Aes.cipher(counterBlock, keySchedule);  // -- encrypt counter block --
            // block size is reduced on final block
            int blockLength = b<blockCount-1 ? blockSize : (plaintext.length()-1)%blockSize+1;
            char[] cipherChar = new char[blockLength];
            for (int i=0; i<blockLength; i++) {
                // -- xor plaintext with ciphered counter char-by-char --
                cipherChar[i] = (char) (cipherCntr[i] ^ plaintext.codePointAt(b*blockSize+i));
            }
            
            ciphertext += new String(cipherChar);
//            ciphertext += cipherChar.join('');
            // if within web worker, announce progress every 1000 blocks (roughly every 50ms)
//            if (typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope) {
//                if (b%1000 == 0) self.postMessage({ progress: b/blockCount });
//            }
        }
	
        String bin = ctrTxt+ciphertext;

        return new String(Base64.getEncoder().encode(bin.getBytes(ENCODING)));

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

        // Derive “key” = AES(pwBytes) expanded to length nBytes
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
        // Here we use “AES in ECB mode” to encrypt the counter block for each block
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
//    		System.out.println(bin.codePointAt(0));
//    		System.out.println(bin.codePointAt(1));
//    		System.out.println(bin.codePointAt(2));
//    		System.out.println(bin.codePointAt(3));
//
//    		System.out.println( new String(Base64.getEncoder().encode(bin.getBytes(ENCODING))));
//  
//    		
    		
    		String msg = "hi man=";
    		
    		String salted = AesCtr.encrypt(msg,"a",128);
    		System.out.println(salted);
    		String plain = AesCtr.decrypt(salted,"a",128);
    		System.out.println(plain);

		} catch (Exception e) {
			e.printStackTrace();
		}

    }
}