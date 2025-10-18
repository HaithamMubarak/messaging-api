package com.hmdev.messaging.agent.core;

import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.AgentInfo;
import com.hmdev.messaging.common.data.ConnectResponse;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import java.util.regex.Pattern;

import com.hmdev.messaging.agent.util.Utils;

import com.hmdev.messaging.agent.api.ConnectionChannelApi;
import com.hmdev.messaging.agent.api.ConnectionChannelApiFactory;

/**
 * Manages a messaging agent connection lifecycle: connect, send/receive (sync/async),
 * and session recovery. Business logic preserved; refactor focuses on readability
 * and maintainability while staying Java 11 compatible.
 */
public class AgentConnection {

    private static final Logger logger = LoggerFactory.getLogger(AgentConnection.class);

    /**
     *  Enable/disable last-session recovery behavior at connect-time.
     */
    @Setter
    private boolean checkLastSession = true;

    private ConnectionChannelApi channelApi;
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
        this.channelApi = ConnectionChannelApiFactory.getConnectionApi(apiUrl);
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
        if (!CommonUtils.isEmpty(connectResponse.getSessionId())) {

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
     * Pull messages using range window [start, end].
     *
     * @param startOffset the starting offset for first message to receive
     * @param limit       the limit of messages to be retuned from receive operation
     * @return list of message events
     */
    public EventMessageResult receive(long startOffset, long limit) {
        logger.debug("ConnectionChannel.receive: {} - {}", startOffset, limit);
        if (!isReady()) {
            return null;
        }

        return channelApi.receive(sessionId, startOffset, limit);
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

        @Setter
        @Getter
        private long startOffset;
        @Getter
        @Setter
        private long limit = 20;

        public RunnableReceive(AgentConnection channel, AgentConnectionEventHandler messageHandler) {
            this.channel = channel;
            this.messageHandler = messageHandler;
        }

        @Override
        public void run() {
            while (channel.isReady()) {
                EventMessageResult messageEventResult = channel.receive(startOffset, limit);
                if (messageEventResult != null) {

                    List<EventMessage> events = messageEventResult.getEvents();
                    if (!events.isEmpty()) {
                        messageHandler.onMessageEvents(events);
                        startOffset = messageEventResult.getNextOffset();
                    }
                }
            }
        }
    }
}