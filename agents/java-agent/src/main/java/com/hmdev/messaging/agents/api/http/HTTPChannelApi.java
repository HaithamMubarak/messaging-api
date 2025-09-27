package com.hmdev.messaging.agents.api.http;

import java.io.ByteArrayInputStream;
import java.security.PublicKey;

import javax.crypto.Cipher;

import org.json.JSONArray;
import org.json.JSONObject;

import com.hmdev.messaging.agents.api.ConnectionChannelApi;
import com.hmdev.messaging.agents.utils.ApiResponse;
import com.hmdev.messaging.agents.utils.HttpClient;
import com.hmdev.messaging.agents.utils.MySecurity;
import com.hmdev.messaging.agents.utils.PemIO;
import com.hmdev.messaging.agents.utils.Utils;
import com.hmdev.messaging.agents.utils.ApiResponse.Status;


public class HTTPChannelApi implements ConnectionChannelApi{

	private final static String PUBLIC_KEY = "public_key.php";
	private final static String CHANNEL_ACTION = "/";
	
	private HttpClient client;
	private Cipher encryptor;

	
	public HTTPChannelApi(String remoteUrl) throws Exception{
		this.client = new HttpClient(remoteUrl);
		
		ApiResponse publicKeyResponse = this.getPublicKey();
		
		if(publicKeyResponse.status() == ApiResponse.Status.ERROR){
			throw new Exception("Unable to get the public key");
		}
	
		PublicKey publicKey = PemIO.readPublicKey(new ByteArrayInputStream(publicKeyResponse.data().getBytes()));
		encryptor = Cipher.getInstance("RSA");		
		encryptor.init(Cipher.ENCRYPT_MODE, publicKey);		
	}
	
	@Override
	public ApiResponse connect(String channelName,String channelKey, String agentName) throws Exception{
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("channelName", channelName);
		jsonObject.put("channelPassword", Utils.md5(channelKey));
		jsonObject.put("agentName", agentName);
		
		String cipherPayload = Utils.blocksEncrypt(this.encryptor, jsonObject.toString());
		
		ApiResponse apiResponse = this.client.request("method=POST",
				"url=/"+"?action=connect",
				"payload="+cipherPayload);
		
		if(apiResponse.status() == ApiResponse.Status.SUCCESS){

			String data =  MySecurity.decryptWithMd5Auth(apiResponse.data(),Utils.md5(channelKey));
			
			if(data == null){
				return new ApiResponse(Status.ERROR, "Corrupted data: AES stage 1 decryption failed");
			}

            // todo: check this part
			//data = MySecurity.decryptWithMd5Auth(data,Utils.md5(channelKey));
			//if(data == null){
			//	return new ApiResponse(Status.ERROR, "Corrupted data: AES state 2 decryption failed");
			//}
			
			return new ApiResponse(Status.SUCCESS, data);

		}else{
			return apiResponse;
		}
	}
	
	@Override
	public ApiResponse receive(String channelKey,String session,String range) {		

		JSONObject jsonObject = new JSONObject();
		jsonObject.put("session", session);
		jsonObject.put("range", range);
		
		String cipherPayload = Utils.blocksEncrypt(this.encryptor, jsonObject.toString());
		
		ApiResponse apiResponse = this.client.request("method=POST",
				"url="+CHANNEL_ACTION+"?action=receive",
				"payload="+cipherPayload);
	
		if(apiResponse.status() == ApiResponse.Status.SUCCESS){
			
			String data =  MySecurity.decryptWithMd5Auth(apiResponse.data(),Utils.md5(channelKey));
			
			if(data == null){
				return new ApiResponse(Status.ERROR, "Corrupted data: AES stage 1 decryption failed");
			}

            JSONObject receivedJson = new JSONObject(data);
			JSONArray cipherArray = receivedJson.getJSONArray("events");
			JSONArray dataArray = new JSONArray();
			
			for(int i=0;i<cipherArray.length();i++){
				
				JSONObject item = cipherArray.getJSONObject(i);
		
				if(item.optBoolean("ecrypted") || true){

					String plain = MySecurity.decryptWithMd5Auth(item.optString("content"),channelKey);
					
					if(plain == null || plain.equals("")){
						item = new JSONObject();
					}else{
						item.remove("content");
						item.remove("ecrypted");
						item.put("content", plain);
					}
				}

				dataArray.put(item);			
				
			}

			return new ApiResponse(Status.SUCCESS, dataArray.toString());

		}else{
			return apiResponse;
		}
	}
	
	@Override
	public ApiResponse send(String msg,String fromUser,String toUser,String key,String session){		
		
		JSONObject msgPayload = new JSONObject();
		msgPayload.put("type", "message");
		msgPayload.put("from", fromUser);
		msgPayload.put("to", toUser);
		msgPayload.put("ecrypted", true);
		msgPayload.put("content",  new JSONObject(MySecurity.encryptWithMd5Auth(msg,key/*+"debug"*/)));// don't enable debug string, payload will be corrupted		
		msgPayload.put("session", session);		
		
		String cipherPayload = Utils.blocksEncrypt(this.encryptor, msgPayload.toString());
		
		return this.client.request("method=POST",
				"url="+CHANNEL_ACTION+"?action=event",
				"payload="+cipherPayload);		
		
	}
	
	@Override
	public ApiResponse disconnect(String channelKey,String session){		
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("password", Utils.md5(channelKey));
		jsonObject.put("session", session);
		
		String cipherPayload = Utils.blocksEncrypt(this.encryptor, jsonObject.toString());
		
		ApiResponse response = this.client.request("method=POST",
				"url="+CHANNEL_ACTION+"?action=disconnect",
				"payload="+cipherPayload);
		
		this.client.closeAll();
		
		return response;
		
	}
	
	private ApiResponse getPublicKey() throws Exception{
		return this.client.request("method=GET","url="+PUBLIC_KEY);
	}
		
}
