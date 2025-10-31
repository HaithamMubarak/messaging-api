package com.hmdev.messaging.agent.api.impl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.HttpClientResult;
import com.hmdev.messaging.common.HttpClient;
import com.hmdev.messaging.common.data.*;
import com.hmdev.messaging.common.security.MySecurity;
import com.hmdev.messaging.common.security.PemIO;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.ByteArrayInputStream;
import java.security.PublicKey;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.Cipher;

import com.hmdev.messaging.agent.api.ConnectionChannelApi;

import java.net.URL;


public class MessagingChannelApi implements ConnectionChannelApi {
    private static final Logger logger = LoggerFactory.getLogger(MessagingChannelApi.class);

    private final static String PUBLIC_KEY = "public_key.php";

    // polling timeout in seconds
    private static final int POLLING_TIMEOUT = 40;

    // Keep this set to false. A public key may be needed in the future, but HTTPS is sufficient for now.
    @Setter
    private boolean usePublicKey = false;

    private final HttpClient client;
    private final ObjectMapper objectMapper;

    @Setter
    @Getter
    private String channelSecret;

    public MessagingChannelApi(String remoteUrl, String developerApiKey) {
        this.client = new HttpClient(remoteUrl);
        this.objectMapper = new ObjectMapper();

        // If a developer API key was provided by the caller, attach it as a default header so all requests include X-Api-Key
        if (developerApiKey != null && !developerApiKey.isBlank()) {
            this.client.setDefaultHeader("X-Api-Key", developerApiKey);
        }

        // Load default developer API key from environment or system property if provided and set as default header
        // NOTE: Developer API key is no longer loaded from environment inside this class.
        // Agents or factories should call `setDeveloperApiKeyId(...)` when creating this API instance
        // if they want to attach an X-Api-Key header to requests.
    }

    @Override
    public ConnectResponse connect(String channelName, String channelPassword, String agentName)  {
        return connect(channelName, channelPassword, agentName, null, null);
    }

    @Override
    public ConnectResponse connect(String channelName, String channelPassword, String agentName, String sessionId)
    {
        return connect(channelName, channelPassword, agentName, sessionId, null);
    }

    @Override
    public ConnectResponse connect(String channelName, String channelPassword, String agentName, String sessionId,
                                   String channelId)  {
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

            boolean hasChannelLogin = (channelName != null && channelPassword != null);
            String passwordHash = null;
            if (hasChannelLogin) {
                this.channelSecret = MySecurity.deriveChannelSecret(channelName, channelPassword);
                passwordHash = MySecurity.hash(channelPassword, this.channelSecret);
            }

            if (channelId == null) {
                if (hasChannelLogin) {
                    // Create channel on server using channelName and passwordHash (protected password)
                    channelId = createChannel(channelName, passwordHash);
                }
                else
                {
                    throw new RuntimeException("Missing channelId or channelName+channelPassword for connect operation");
                }
            }

            // Build connect request: prefer channelId if known, but include name/password fields for compatibility
            ConnectRequest connectRequest = new ConnectRequest(channelId, channelName, passwordHash, agentName, createAgentContext());
            connectRequest.setSessionId(sessionId);

            HttpClientResult httpClientResult = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("connect"), connectRequest);

            if (httpClientResult != null && httpClientResult.isHttpOk()) {
                // Controller wraps connect response in { status: 'success', data: { ... } }
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
    public ConnectResponse connectWithChannelId(String agentName, String channelId, String sessionId) {
        return this.connect(null, null, agentName, sessionId, channelId);
    }

    // New helper: create channel on the server and return channelId if available
    private String createChannel(String name, String password) {
        try {
            HttpClientResult res = this.client.request(HttpClient.RequestMethod.POST,
                    getActionUrl("create-channel"), new CreateChannelRequest(name, password));

            if (res != null && res.isHttpOk()) {
                // todo: use dto instead of manual parsing
                return res.dataAsJsonObject().optJSONObject("data").optString("channelId", null);
            }
        } catch (Exception e) {
            logger.warn("create-channel failed: {}", e.getMessage());
        }
        return null;
    }


    @Override
    public EventMessageResult receive(String sessionId, ReceiveConfig receiveConfig) {
        EventMessageResult eventMessageResult = new EventMessageResult(new ArrayList<>(), null, null);
        try {
            MessageReceiveRequest messageReceiveRequest = new MessageReceiveRequest();
            messageReceiveRequest.setSessionId(sessionId);
            // Ensure we send JSON with fields globalOffset, localOffset, limit in correct order
            messageReceiveRequest.setOffsetRange(new ReceiveConfig(receiveConfig.getGlobalOffset(), receiveConfig.getLocalOffset(), receiveConfig.getLimit()));

            HttpClientResult httpClientResult = this.client.request(HttpClient.RequestMethod.POST, getActionUrl("receive"),
                    messageReceiveRequest, POLLING_TIMEOUT * 1000);


            if (httpClientResult.isHttpOk())
            {
                eventMessageResult = objectMapper.readValue(httpClientResult.dataAsJsonObject().optJSONObject("data").toString(),
                        EventMessageResult.class);

                // Decrypt any encrypted events using the derived channelSecret (if present)
                for (EventMessage ev : eventMessageResult.getEvents()) {
                    if (ev != null && ev.isEncrypted()) {
                        try {
                            String plain = MySecurity.decryptAndVerify(ev.getContent(), this.channelSecret);
                            ev.setContent(plain);
                            ev.setEncrypted(false);
                        } catch (Exception ex) {
                            logger.debug("Failed to decrypt event content: {}", ex.getMessage());
                        }
                    }
                }

                return eventMessageResult;
            }
        } catch (Exception e) {
            logger.error("Exception caught in receive operation {}", e.getLocalizedMessage());
        }
        logger.debug("Unable to receive messages");
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
    public boolean send(String msg, String destination, String sessionId){
        return send(EventMessage.EventType.CHAT_TEXT, msg, destination, sessionId, true);
    }

    @Override
    public boolean send(EventMessage.EventType eventType, String msg, String destination, String sessionId, boolean encrypted) {

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
        // Align exactly with kafka-service controller URLs
        return String.format("/%s", action);
    }

    private AgentInfo.AgentContext createAgentContext() {
        return new AgentInfo.AgentContext("JAVA-AGENT", MessagingChannelApi.class.getName(), null);
    }

}
