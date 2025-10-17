package com.hmdev.messaging.agent.api.http;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.HttpClientResult;
import com.hmdev.messaging.common.HttpClient;
import com.hmdev.messaging.common.data.*;
import com.hmdev.messaging.common.security.MySecurity;
import com.hmdev.messaging.common.security.PemIO;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.ByteArrayInputStream;
import java.security.PublicKey;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.Cipher;

import com.hmdev.messaging.agent.api.ConnectionChannelApi;


public class HTTPChannelApi implements ConnectionChannelApi {
    private static final Logger logger = LoggerFactory.getLogger(HTTPChannelApi.class);

    private final static String PUBLIC_KEY = "public_key.php";

    // polling timeout in seconds
    private static final int POLLING_TIMEOUT = 40;

    // Keep this set to false. A public key may be needed in the future, but HTTPS is sufficient for now.
    @Setter
    private boolean usePublicKey = false;

    private final HttpClient client;
    private final ObjectMapper objectMapper;

    private String channelSecret;

    public HTTPChannelApi(String remoteUrl) {
        this.client = new HttpClient(remoteUrl);
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public ConnectResponse connect(String channelName, String channelKey, String agentName)  {
        return connect(channelName, channelKey, agentName, null);
    }

    @Override
    public ConnectResponse connect(String channelName, String channelKey, String agentName, String sessionId)  {
        try {
            if (usePublicKey) {
                HttpClientResult publicKeyResponse = this.getPublicKey();

                if (publicKeyResponse.isHttpOk()) {
                    throw new Exception("Unable to get the public key");
                }
                PublicKey publicKey = PemIO.readPublicKey(new ByteArrayInputStream(publicKeyResponse.getData().getBytes()));
                Cipher pubKeyEncryptor = Cipher.getInstance("RSA");
                pubKeyEncryptor.init(Cipher.ENCRYPT_MODE, publicKey);
                client.setPublicKeyEncryptor(pubKeyEncryptor);
            }

            this.channelSecret = MySecurity.deriveChannelSecret(channelName, channelKey);

            ConnectRequest connectRequest = new ConnectRequest(channelName, MySecurity.hash(channelKey, this.channelSecret),
                    agentName, createAgentContext());
            connectRequest.setSessionId(sessionId);

            HttpClientResult httpClientResult = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("connect"),
                    connectRequest);

            if (httpClientResult.isHttpOk()) {
                return objectMapper.readValue(
                        httpClientResult.dataAsJsonObject().optJSONObject("data").toString(), ConnectResponse.class);
            }
        } catch (Exception e) {
            logger.error("Exception caught in connect operation {}", e.getLocalizedMessage());
        }
        logger.debug("Unable to connect to the channel");
        return new ConnectResponse();
    }

    @Override
    public EventMessageResult receive(String sessionId, long startOffset, long limit) {
        EventMessageResult eventMessageResult = new EventMessageResult(new ArrayList<>(), startOffset);
        try {
            MessageReceiveRequest messageReceiveRequest = new MessageReceiveRequest();
            messageReceiveRequest.setSessionId(sessionId);
            messageReceiveRequest.setOffsetRange(new OffsetRange(startOffset, limit));

            HttpClientResult httpClientResult = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("receive"),
                    messageReceiveRequest, POLLING_TIMEOUT * 1000);


            if (httpClientResult.isHttpOk())
            {
                eventMessageResult = objectMapper.readValue(httpClientResult.dataAsJsonObject().optJSONObject("data").toString(),
                        EventMessageResult.class);
            }

            for (EventMessage event : eventMessageResult.getEvents()) {
                if (event.isEncrypted()) {
                    String plain = MySecurity.decryptAndVerify(event.getContent(), channelSecret);
                    event.setEncrypted(false);
                    event.setContent(plain);
                }
            }

        } catch (Exception e) {
            logger.error("Exception for receive operation: {}", e.getMessage());
        }
        return eventMessageResult;
    }

    @Override
    public List<AgentInfo> getActiveAgents(String sessionId) {
        try {
            SessionRequest sessionRequest = new SessionRequest(sessionId);

            HttpClientResult httpClientResult = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("list-agents"),
                    sessionRequest);

            if (httpClientResult.isHttpOk()) {
                return objectMapper.readValue(httpClientResult.dataAsJsonObject().optJSONArray("data").toString(),
                        new TypeReference<>() {
                        });
            }

        } catch (Exception e) {
            logger.error("Exception for getActiveAgents operation: {}", e.getMessage());
        }
        return new ArrayList<>();
    }

    @Override
    public boolean send(String msg, String destination, String sessionId) {

        try {
            EventMessageRequest eventMessageRequest = new EventMessageRequest();

            eventMessageRequest.setSessionId(sessionId);
            eventMessageRequest.setType(EventMessage.EventType.CHAT_TEXT);
            eventMessageRequest.setTo(destination);
            eventMessageRequest.setEncrypted(true);
            eventMessageRequest.setContent(MySecurity.encryptAndSign(msg, channelSecret));

            return this.client.request(HttpClient.RequestMethod.POST,
                    getActionUrl("event"), eventMessageRequest).isHttpOk();
        }
        catch (Exception e) {
            logger.error("Exception for send operation: {}", e.getMessage());
        }

        return false;
    }

    @Override
    public boolean disconnect(String sessionId) {

        try {
            SessionRequest sessionRequest = new SessionRequest(sessionId);

            HttpClientResult response = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("disconnect"),
                    sessionRequest);

            this.client.closeAll();

            return response.isHttpOk();
        }
        catch (Exception exception)
        {
            logger.error("Exception for disconnect operation: {}", exception.getMessage());
        }

        return false;
    }

    private HttpClientResult getPublicKey() {
        return this.client.request(HttpClient.RequestMethod.GET, PUBLIC_KEY, null);
    }

    private String getActionUrl(String action) {
        return String.format("/%s?use-pubkey=%s", action, usePublicKey);
    }

    private AgentInfo.AgentContext createAgentContext() {
        return new AgentInfo.AgentContext("JAVA-AGENT", HTTPChannelApi.class.getName(), null);
    }
}