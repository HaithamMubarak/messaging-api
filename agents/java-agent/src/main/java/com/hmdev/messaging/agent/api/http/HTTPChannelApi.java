package com.hmdev.messaging.agent.api.http;

import com.hmdev.messaging.agent.security.MySecurity;
import com.hmdev.messaging.agent.security.PemIO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.ByteArrayInputStream;
import java.security.PublicKey;

import javax.crypto.Cipher;

import org.json.JSONArray;
import org.json.JSONObject;

import com.hmdev.messaging.agent.api.ConnectionChannelApi;
import com.hmdev.messaging.agent.util.ApiResponse;
import com.hmdev.messaging.agent.util.HttpClient;
import com.hmdev.messaging.agent.util.ApiResponse.Status;


public class HTTPChannelApi implements ConnectionChannelApi {
    private static final Logger logger = LoggerFactory.getLogger(HTTPChannelApi.class);

    private final static String PUBLIC_KEY = "public_key.php";

    // Keep this set to false. A public key may be needed in the future, but HTTPS is sufficient for now.
    private boolean usePublicKey = false;

    private final HttpClient client;
    private Cipher pubKeyEncryptor;

    private String channelSecret;

    public HTTPChannelApi(String remoteUrl) {
        this.client = new HttpClient(remoteUrl);
    }

    @Override
    public ApiResponse connect(String channelName, String channelKey, String agentName) throws Exception {
        return connect(channelName, channelKey, agentName, null);
    }

    @Override
    public ApiResponse connect(String channelName, String channelKey, String agentName, String sessionId) throws Exception {

        if (usePublicKey) {
            ApiResponse publicKeyResponse = this.getPublicKey();

            if (publicKeyResponse.status() == ApiResponse.Status.ERROR) {
                throw new Exception("Unable to get the public key");
            }
            PublicKey publicKey = PemIO.readPublicKey(new ByteArrayInputStream(publicKeyResponse.getData().getBytes()));
            pubKeyEncryptor = Cipher.getInstance("RSA");
            pubKeyEncryptor.init(Cipher.ENCRYPT_MODE, publicKey);
        }

        this.channelSecret = MySecurity.deriveChannelSecret(channelName, channelKey);

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("channelName", channelName);
        jsonObject.put("channelPassword", MySecurity.hash(channelKey, this.channelSecret));
        jsonObject.put("agentName", agentName);
        jsonObject.put("agentContext", createAgentContext());
        jsonObject.put("session", sessionId);

        String cipherPayload = MySecurity.blocksEncrypt(this.pubKeyEncryptor, jsonObject.toString());

        ApiResponse apiResponse = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("connect"), cipherPayload);

        if (apiResponse.status() == ApiResponse.Status.SUCCESS) {

            JSONObject data = apiResponse.asJsonResponse().getJsonData().optJSONObject("data");

            return new ApiResponse(Status.SUCCESS, data);

        } else {
            return apiResponse;
        }
    }

    @Override
    public ApiResponse receive(String session, String range) {

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("session", session);
        jsonObject.put("range", range);

        String cipherPayload = MySecurity.blocksEncrypt(this.pubKeyEncryptor, jsonObject.toString());

        ApiResponse apiResponse = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("receive"), cipherPayload);

        if (apiResponse.status() == ApiResponse.Status.SUCCESS) {
            JSONObject receivedJson = apiResponse.asJsonResponse().getJsonData().optJSONObject("data");
            JSONArray cipherArray = receivedJson.getJSONArray("events");
            JSONArray dataArray = new JSONArray();

            for (int i = 0; i < cipherArray.length(); i++) {

                JSONObject item = cipherArray.getJSONObject(i);

                if (item.optBoolean("encrypted")) {

                    String plain = MySecurity.decryptAndVerify(item.optString("content"), channelSecret);

                    if (plain == null || plain.isEmpty()) {
                        item = new JSONObject();
                    } else {
                        item.remove("content");
                        item.remove("encrypted");
                        item.put("content", plain);
                    }
                }

                dataArray.put(item);

            }

            return new ApiResponse(Status.SUCCESS, dataArray.toString(), receivedJson.optIntegerObject("updateLength"));

        } else {
            return apiResponse;
        }
    }

    @Override
    public ApiResponse getActiveAgents(String session) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("session", session);

        ApiResponse apiResponse = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("active-agents"), jsonObject.toString());

        if (apiResponse.status() == ApiResponse.Status.SUCCESS) {

            String dataJson = apiResponse.asJsonResponse().getJsonData().optJSONArray("data").toString();

            return new ApiResponse(Status.SUCCESS, dataJson);

        } else {
            return apiResponse;
        }
    }

    @Override
    public ApiResponse send(String msg, String destAgent, String session) {

        JSONObject msgPayload = new JSONObject();
        msgPayload.put("type", "chat-text");
        msgPayload.put("to", destAgent);
        msgPayload.put("encrypted", true);
        msgPayload.put("content", new JSONObject(MySecurity.encryptAndSign(msg, channelSecret)));
        msgPayload.put("session", session);

        String cipherPayload = MySecurity.blocksEncrypt(this.pubKeyEncryptor, msgPayload.toString());

        return this.client.request(HttpClient.RequestMethod.POST, getActionUrl("event"), cipherPayload);
    }

    @Override
    public ApiResponse disconnect(String session) {

        JSONObject jsonObject = new JSONObject();
         jsonObject.put("session", session);

        String cipherPayload = MySecurity.blocksEncrypt(this.pubKeyEncryptor, jsonObject.toString());


        ApiResponse response = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("disconnect"), cipherPayload);

        this.client.closeAll();

        return response;

    }

    private ApiResponse getPublicKey() {
        return this.client.request(HttpClient.RequestMethod.GET, PUBLIC_KEY, null);
    }

    private String getActionUrl(String action) {
        return "/" + "?use-pubkey=" + usePublicKey + "&action=" + action;
    }

    private JSONObject createAgentContext()
    {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("agentType", "JAVA-AGENT");
        jsonObject.put("descriptor", HTTPChannelApi.class.getName());
        return jsonObject;
    }
}