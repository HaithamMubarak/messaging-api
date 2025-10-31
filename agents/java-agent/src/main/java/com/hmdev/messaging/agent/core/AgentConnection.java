package com.hmdev.messaging.agent.core;

import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.AgentInfo;
import com.hmdev.messaging.common.data.ConnectResponse;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.data.ReceiveConfig;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import java.util.regex.Pattern;

import com.hmdev.messaging.agent.util.Utils;

import com.hmdev.messaging.agent.api.ConnectionChannelApi;
import com.hmdev.messaging.agent.api.ConnectionChannelApiFactory;
import com.hmdev.messaging.common.crypto.EnvelopeUtil;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.time.Duration;

/**
 * Manages a messaging agent connection lifecycle: connect, send/receive (sync/async),
 * and session recovery. Business logic preserved; refactor focuses on readability
 * and maintainability while staying Java 11 compatible.
 */
public class AgentConnection {

    private static final Logger logger = LoggerFactory.getLogger(AgentConnection.class);
    private static final Long DEFAULT_RECEIVE_LIMIT = 20L ;
    private static final long PASSWORD_WAIT_TIMEOUT_SECONDS = 5;

    /**
     *  Enable/disable last-session recovery behavior at connect-time.
     */
    @Setter
    private boolean checkLastSession = true;

    private final ConnectionChannelApi channelApi;
    private String agentName;
    private String sessionId;

    private boolean readyState = false;
    private Thread receiveThread;
    @Getter
    private long connectionTime;

    /**
     * Create an AgentConnection bound to a backend API endpoint.
     *
     * @param apiUrl    Base URL of messaging API
     *
     */
    public AgentConnection(String apiUrl) {
        this(apiUrl, null);
    }

    public AgentConnection(String apiUrl, String developerApiKey) {
        this.channelApi = ConnectionChannelApiFactory.getConnectionApi(apiUrl, developerApiKey);
    }


    /**
     * Connect to a channel with given credentials.
     *
     * @param channelName     Channel to connect
     * @param channelPassword Password/secret for the channel
     * @param agentName       Name/identifier of this agent
     * @return true if connected successfully, false otherwise
     */
    public boolean connect(String channelName, String channelPassword, String agentName) throws Exception {

        this.agentName = agentName;
        if (readyState && sessionId != null) {
            throw new Exception("Agent is " + agentName + " is already connected with session " + sessionId);
        }

        if (this.sessionId == null && checkLastSession) {
            this.sessionId = Utils.loadSessionId(channelName);
        }
        ConnectResponse connectResponse = channelApi.connect(channelName, channelPassword, this.agentName, this.sessionId);

        // Success result
        if (CommonUtils.isNotEmpty(connectResponse.getSessionId())) {

            logger.debug("Connection Response is {}", connectResponse);
            this.sessionId = connectResponse.getSessionId();
            this.connectionTime =  connectResponse.getDate();
            readyState = true;
            logger.debug("Connected to session : {}", this.sessionId);

            Utils.saveSessionId(channelName, this.sessionId);
            return true;
        } else {
            return false;
        }

    }

    /**
     * Connect using a server-side channelId. Optionally provide the channelName so the agent can derive
     * the channel secret after a PASSWORD_REPLY is received (password-based secret derivation requires channelName).
     */
    public boolean connectWithChannelId(String channelId, String agentName) throws Exception {
        this.agentName = agentName;
        if (readyState && sessionId != null) {
            throw new Exception("Agent " + agentName + " is already connected with session " + sessionId);
        }

        if (this.sessionId == null && checkLastSession) {
            this.sessionId = Utils.loadSessionId(channelId);
        }

        ConnectResponse connectResponse = channelApi.connectWithChannelId(channelId, this.agentName, this.sessionId);

        if (CommonUtils.isNotEmpty(connectResponse.getSessionId())) {
            logger.debug("Connection Response is {}", connectResponse);
            this.sessionId = connectResponse.getSessionId();
            this.connectionTime = connectResponse.getDate();

            if (CommonUtils.isEmpty(channelApi.getChannelSecret())) {
                try {
                    // Generate ephemeral RSA keypair for the request
                    KeyPair keypair = EnvelopeUtil.generateRSAKeyPair();
                    String pubB64 = EnvelopeUtil.encodeRSAPublicKey(keypair.getPublic());

                    // Send PASSWORD_REQUEST event with public key
                    channelApi.send(EventMessage.EventType.PASSWORD_REQUEST, pubB64, "*" , this.sessionId, false);

                    // Poll for PASSWORD_REPLY targeted to this agent for up to 10s
                    boolean gotPassword = waitForPasswordReply(connectResponse.getMetadata().getGlobalOffset(),
                            connectResponse.getMetadata().getLocalOffset(), keypair, Duration.ofSeconds(PASSWORD_WAIT_TIMEOUT_SECONDS).toMillis());

                } catch (Exception ex) {
                    logger.warn("PASSWORD_REQUEST flow failed: {}", ex.getMessage());
                }
            }

            readyState = true;
            logger.debug("Connected to session : {}", this.sessionId);

            Utils.saveSessionId(channelId, this.sessionId);
            return true;
        }
        return false;
    }

    /**
     * Disconnects the agent and performs any cleanup required.
     */

    public boolean disconnect() {

        if (!readyState) {
            logger.debug("Channel connection {} is already disconnected.", agentName);
        }

        boolean result = channelApi.disconnect(sessionId);

        if (result)
        {
            sessionId = null;
            readyState = false;
        }

        return result;

    }

    /**
     * Pull messages using an ReceiveConfig object.
     *
     * @param receiveConfig the receive config for receive operation
     * @return list of message events
     */
    public EventMessageResult receive(ReceiveConfig receiveConfig) {
        logger.debug("ConnectionChannel.receive: {}", receiveConfig);
        if (!isReady()) {
            return null;
        }

        return channelApi.receive(sessionId, receiveConfig);
    }

    /**
     * Gets all agents
     *
     * @return return the list of all agents
     */
    public List<AgentInfo> getActiveAgents() {

        logger.debug("ConnectionChannel.getActiveAgents: ");

        if (!isReady()) {
            return null;
        }

        return channelApi.getActiveAgents(sessionId);
    }

    /**
     * Starts an asynchronous polling routine that emits batches to the handler.
     *
     * @param messageHandler callback for message-arrival events
     */
    public void receiveAsync(AgentConnectionEventHandler messageHandler) {
        if (receiveThread == null) {
            receiveThread = new Thread(new RunnableReceive(this, messageHandler));
            receiveThread.start();
        } else {
            logger.debug("Asynchronous receive is already running.");
        }
    }

    /**
     * Starts an asynchronous polling routine that emits batches to the handler.
     *
     * @param messageHandler callback for message-arrival events
     */
    public void receiveAsync(AgentConnectionEventHandler messageHandler, ReceiveConfig initialReceiveConfig) {
        if (receiveThread == null) {
            receiveThread = new Thread(new RunnableReceive(this, messageHandler, initialReceiveConfig));
            receiveThread.start();
        } else {
            logger.debug("Asynchronous receive is already running.");
        }
    }

    /**
     * Send a message to a specific destination (agent or topic).
     *
     * @param msg         message body
     * @param destination destination routing value
     * @return true on success, false on failure
     */

    public boolean sendMessage(String msg, String destination) {
        return sendMessage(msg, "*", false);
    }

    /**
     * Broadcast or default-route send, depending on server defaults.
     *
     * @param msg message body
     * @return true on success, false otherwise
     */

    public boolean sendMessage(String msg) {
        return sendMessage(msg, "*", true);
    }

    /**
     * Send a message to destination, optionally marking destination as a regex filter.
     *
     * @param content       message body
     * @param destination   destination or filter
     * @param asFilterRegex whether destination is a regex to filter recipients
     * @return true on success, false otherwise
     */
    public boolean sendMessage(String content, String destination, boolean asFilterRegex) {

        if (!isReady()) {
            return false;
        }

        return channelApi.send(content, asFilterRegex ? destination : Pattern.quote(destination),
                sessionId);
    }

    public boolean isReady()
    {
        if (!readyState || sessionId == null) {
            logger.debug("Unable use channel operation, channel is not ready");
            return false;
        }
        else
        {
            return true;
        }
    }

    public static class RunnableReceive implements Runnable {

        private final AgentConnection channel;
        private final AgentConnectionEventHandler messageHandler;

        @Getter
        @Setter
        private ReceiveConfig offsetRange;

        public RunnableReceive(AgentConnection channel, AgentConnectionEventHandler messageHandler) {
            this(channel, messageHandler,  new ReceiveConfig(0L, 0L, DEFAULT_RECEIVE_LIMIT));
        }

        public RunnableReceive(AgentConnection channel, AgentConnectionEventHandler messageHandler,
                               ReceiveConfig initialReceiveConfig) {
            this.channel = channel;
            this.messageHandler = messageHandler;
            this.offsetRange = initialReceiveConfig;
        }

        @Override
        public void run() {
            while (channel.isReady()) {
                EventMessageResult messageEventResult = channel.receive(offsetRange);
                if (messageEventResult != null) {

                    List<EventMessage> events = messageEventResult.getEvents();
                    if (!events.isEmpty()) {
                        messageHandler.onMessageEvents(events);
                        // advance global and local offsets for next read
                        if (messageEventResult.getNextGlobalOffset() != null) {
                            this.offsetRange.setGlobalOffset(messageEventResult.getNextGlobalOffset());
                        }
                        if (messageEventResult.getNextLocalOffset() != null) {
                            this.offsetRange.setLocalOffset(messageEventResult.getNextLocalOffset());
                        }
                    }
                }
            }
        }
    }

    // Wait for a PASSWORD_REPLY addressed to this agent, decrypt it using the provided KeyPair
    // and set the channel secret via channelApi.setChannelSecret(secret). Returns true on success.
    private boolean waitForPasswordReply(Long globalOffset, Long localOffset, KeyPair kp, long timeoutMs) {
        final long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            EventMessageResult res = this.receive(new ReceiveConfig(globalOffset, localOffset, DEFAULT_RECEIVE_LIMIT));
            if (res != null && res.getEvents() != null) {
                for (EventMessage ev : res.getEvents()) {
                    if (ev.getDate() > this.connectionTime
                            && ev.getType() == EventMessage.EventType.PASSWORD_REPLY
                            && this.agentName.equals(ev.getTo()))
                    {
                        try {
                            byte[] cipher = java.util.Base64.getDecoder().decode(ev.getContent());
                            byte[] plain = EnvelopeUtil.rsaDecrypt(kp.getPrivate(), cipher);
                            String secret = new String(plain, StandardCharsets.UTF_8);
                            channelApi.setChannelSecret(secret);
                            return true;
                        } catch (Exception e) {
                            logger.warn("Failed to unwrap PASSWORD_REPLY: {}", e.getMessage());
                            // continue waiting for another reply until timeout
                        }
                    }
                }
                globalOffset = res.getNextGlobalOffset();
                localOffset = res.getNextLocalOffset();
            }
            try {
                Thread.sleep(400);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return false;
    }
}
