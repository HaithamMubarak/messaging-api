package com.hmdev.messaging.agents.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;

import com.hmdev.messaging.agents.utils.aes.AesCtr;

public class MySecurity{

	public static String encryptWithMd5Auth(String $message,String $key){
		JSONObject $myObj = new JSONObject("{}");
		$myObj.put("cipher",encrypt($message, $key));
		$myObj.put("md5", Utils.md5($message));
		return $myObj.toString();
	}
	
	public static String decryptWithMd5Auth(String $cipherMsgStr,String $key){
		
		try{
			JSONObject $cipherMsg = new JSONObject($cipherMsgStr);

			String $message = decrypt($cipherMsg.optString("cipher"), $key);
	
			if(!Utils.md5($message).trim().equals($cipherMsg.optString("md5").trim())){
				return null;
			}else{
				return $message;
			}
		}catch(Exception e){
			System.out.println("decryptWithMd5Auth error: "+e.getMessage());
			return null;
		}

	}
	
	public static String encrypt(String $plain,String $key){
		try {
			return AesCtr.encrypt($plain, $key, 128);
		} catch (Exception e) {
			e.printStackTrace();
			return "";
		}
	}
	
	public static String decrypt(String $cipher,String $key){
		try{
			return  AesCtr.decrypt($cipher, $key, 128);
		}catch(Exception e){
			System.out.println("decrypt error: "+e.getMessage());
		}
		
		return null;		

	}
	
	public static void main(String[] args) throws FileNotFoundException, IOException{

        if (true)
        {
            JSONObject jsonObject = new JSONObject("{\"cipher\":\"ugI\\/FPEM2GjpF96B5rDHaI2SexrX213OLcYxXCSM\\/T+Hn\\/LiB7pSnUXi6ulLC\\/Qn\\/+uYah4l+OXTpr+TqDIRWqCT5NzCCxGTdgNl0ka9EB6XjdiTXh8tYTvDFkWRDX02b6xIp7\\/jnZucIk1pr65+VsQFOX8El6wwKGYkGUM5Et1R\",\"md5\":\"65aa16f67f565a4a9c124fa3b4f9a96e\"}");
            System.out.println("" + jsonObject.optString("cipher"));
            String res = MySecurity.decrypt(jsonObject.optString("cipher"),
                    Utils.md5("12345678"));

            System.out.println(res);
            return;
        }
		boolean enc = false;
		String filePath = "";
		String key = "";	

		String path = filePath+(!enc?".enc":"");

		File file =  new File(path);
		String str = IOUtils.toString(new FileInputStream(file));
		
		if(enc){
			IOUtils.write(MySecurity.encrypt(str, key), new FileOutputStream(file.getAbsolutePath()+".enc"),AesCtr.ENCODING);
		}else{
			IOUtils.write(MySecurity.decrypt(str, key), new FileOutputStream(file.getParent()+"/"+"recovered_"+file.getName().replaceAll("\\.enc$", "")),AesCtr.ENCODING);
		}
	}

}