package com.hmdev.messaging.agent.core;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.agent.data.AgentRecord;
import com.hmdev.messaging.agent.data.MessageEvent;
import com.hmdev.messaging.agent.data.MessageEventResult;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import com.hmdev.messaging.agent.util.SessionRecoveryUtility;

import com.hmdev.messaging.agent.api.ConnectionChannelApi;
import com.hmdev.messaging.agent.api.ConnectionChannelApiFactory;
import com.hmdev.messaging.agent.util.ApiResponse;
import com.hmdev.messaging.agent.util.ApiResponse.Status;
import com.hmdev.messaging.agent.util.Utils;
import org.json.JSONObject;

/**
 * Manages a messaging agent connection lifecycle: connect, send/receive (sync/async),
 * and session recovery. Business logic preserved; refactor focuses on readability
 * and maintainability while staying Java 11 compatible.
 */
public class AgentConnection {

    private static final Logger logger = LoggerFactory.getLogger(AgentConnection.class);

    /**
     * -- SETTER --
     *  Enable/disable last-session recovery behavior at connect-time.
     *
     * @param checkLastSession true to restore if available
     */
    @Setter
    private boolean checkLastSession = true;

    private ConnectionChannelApi channelApi;
    private final String agentName;
    private String sessionId;

    private boolean readyState = false;
    private Thread receiveThread;

    private ObjectMapper mapper = new ObjectMapper();
    @Getter
    private long connectionTime;

    /**
     * Create an AgentConnection bound to a backend API endpoint.
     *
     * @param apiUrl    Base URL of messaging API
     * @param agentName Name/identifier of this agent
     */

    public AgentConnection(String apiUrl, String agentName) {
        this.agentName = agentName;
        this.channelApi = ConnectionChannelApiFactory.getConnectionApi(apiUrl);
    }


    /**
     * Connect to a channel with given credentials.
     *
     * @param channelName     Channel to connect
     * @param channelPassword Password/secret for the channel
     * @return true if connected successfully, false otherwise
     */

    public boolean connect(String channelName, String channelPassword) throws Exception {

        if (readyState && sessionId != null) {
            throw new Exception("Agent is " + agentName + " is already connected with session " + sessionId);
        }

        if (this.sessionId == null && checkLastSession) {
            this.sessionId = SessionRecoveryUtility.loadSessionId(channelName);
        }
        ApiResponse connectResponse = channelApi.connect(channelName, channelPassword, this.agentName, this.sessionId);

        if (connectResponse.status() == Status.SUCCESS) {

            JSONObject jsonObject = connectResponse.getJsonData();
            logger.debug("Connection Response is " + jsonObject);
            this.sessionId = jsonObject.optString("sessionId");
            this.connectionTime =  jsonObject.optLong("date");
            readyState = true;
            logger.debug("Connected to session : " + this.sessionId);

            SessionRecoveryUtility.saveSessionId(channelName, this.sessionId);
            return true;
        } else {
            logger.debug("Unable to connect: " + connectResponse.getData());
            return false;
        }

    }


    /**
     * Disconnects the agent and performs any cleanup required.
     */

    public void disconnect() {

        if (!readyState) {
            logger.debug("Channel connection " + agentName + " is already disconnected.");
        }

        channelApi.disconnect(sessionId);

        sessionId = null;
        channelApi = null;
        readyState = false;
    }

    /**
     * Pull messages using range window [start, end].
     *
     * @param start starting index (inclusive) according to API semantics
     * @param end   ending index (inclusive) per API semantics
     * @return list of message events
     */
    public MessageEventResult receive(long start, long end) {
        logger.debug("ConnectionChannel.receive: " + start + " -  " + end);
        if (!readyState || sessionId == null) {
            logger.debug("Channel is not ready for receive mode.");
            return null;
        }

        ApiResponse revResponse = channelApi.receive(sessionId, start + "-" + end);

        if (revResponse.status() == Status.SUCCESS) {
            try {
                List<MessageEvent> events = mapper.readValue(revResponse.getData(), new TypeReference<>() {
                });
                return new MessageEventResult(events, revResponse.getUpdateLength());
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            logger.debug("Receive Error: " + revResponse.getData());
        }
        return new MessageEventResult(new ArrayList<>(), 0);
    }

    /**
     * Gets all active agents
     *
     * @return return the list of all active agents
     */
    public List<AgentRecord> getActiveAgents() {

        logger.debug("ConnectionChannel.getActiveAgents: ");

        if (!readyState || sessionId == null) {
            logger.debug("Channel is not ready ");
            return null;
        }

        ApiResponse revResponse = channelApi.getActiveAgents(sessionId);

        if (revResponse.status() == Status.SUCCESS) {
            try {
                return mapper.readValue(revResponse.getData(), new TypeReference<>() {
                });
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            logger.debug("getActiveAgents Error: " + revResponse.getData());
        }

        return new ArrayList<>();
    }

    /**
     * Starts an asynchronous polling routine that emits batches to the handler.
     *
     * @param messageHandler callback for message-arrival events
     */
    public void receiveAsync(AgentConnectionEventHandler messageHandler) throws Exception {

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
        return sendMessage(msg, ".*", false);
    }


    /**
     * Broadcast or default-route send, depending on server defaults.
     *
     * @param msg message body
     * @return true on success, false otherwise
     */

    public boolean sendMessage(String msg) {
        return sendMessage(msg, ".*", true);
    }


    /**
     * Send a message to destination, optionally marking destination as a regex filter.
     *
     * @param msg           message body
     * @param destination   destination or filter
     * @param asFilterRegex whether destination is a regex to filter recipients
     * @return true on success, false otherwise
     */

    public boolean sendMessage(String msg, String destination, boolean asFilterRegex) {

        if (!readyState || sessionId == null) {
            logger.debug("Channel is " + agentName + " is not ready ");
            return false;
        }

        ApiResponse connectResponse = channelApi.send(msg, asFilterRegex ? destination : Pattern.quote(destination), sessionId);
        return connectResponse.status() == Status.SUCCESS;
    }

    public static class RunnableReceive implements Runnable {

        private final AgentConnection channel;
        private final AgentConnectionEventHandler messageHandler;

        public RunnableReceive(AgentConnection channel, AgentConnectionEventHandler messageHandler) {
            this.channel = channel;
            this.messageHandler = messageHandler;
        }

        @Override
        public void run() {

            int size = 10;

            long start = 0;
            long end = start + size;

            while (channel.readyState) {

                MessageEventResult messageEventResult = channel.receive(start, end);

                if (messageEventResult != null) {

                    List<MessageEvent> events = messageEventResult.getMessageEvents();
                    if (!events.isEmpty()) {
                        messageHandler.onMessageEvents(events);
                    }

                    long dataLength = messageEventResult.getUpdateLength();

                    start += dataLength;
                    end += dataLength;
                }

                Utils.sleep(1000);
            }
        }

    }
}