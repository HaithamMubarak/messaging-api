package com.hmdev.messaging.agents.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.Cipher;

public class Utils {

	public static String blocksEncrypt(Cipher encryptor,String plain){
		
		try{
			StringBuffer cipherPayload = new StringBuffer();
			
			for(int i=0;i<plain.length();i+=200){
				
				int upperLimit = i+200;
				upperLimit = (upperLimit >= plain.length())?plain.length():upperLimit;
			
				byte[] salted = encryptor.doFinal(plain.substring(i,upperLimit).getBytes());
				
				cipherPayload.append(new String(Base64.getEncoder().encode(salted)));
			}
			
			return cipherPayload.toString();
		}catch(Exception e){
			e.printStackTrace();
			return "";
		}
		
	}
	
	public static String md5(String msg){
		MessageDigest md;
		try {
			md = MessageDigest.getInstance("MD5");
			byte[] salted = md.digest(msg.getBytes());			
			return toHexString(salted);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
			return null;
		}
		
		
	}
	public static String toHexString(byte[] bytes) {
	    StringBuilder hexString = new StringBuilder();

	    for (int i = 0; i < bytes.length; i++) {
	        String hex = Integer.toHexString(0xFF & bytes[i]);
	        if (hex.length() == 1) {
	            hexString.append('0');
	        }
	        hexString.append(hex);
	    }

	    return hexString.toString();
	}

	
	public static void sleep(long timeout){
		try {
			Thread.sleep(timeout);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

}
