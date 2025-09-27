package com.hmdev.messaging.agents;

import java.util.regex.Pattern;

import org.json.JSONArray;

import com.hmdev.messaging.agents.api.ConnectionChannelApi;
import com.hmdev.messaging.agents.api.ConnectionChannelApiFactory;
import com.hmdev.messaging.agents.utils.ApiResponse;
import com.hmdev.messaging.agents.utils.ApiResponse.Status;
import com.hmdev.messaging.agents.utils.Utils;
import org.json.JSONObject;

public class ConnectionChannel {

    private ConnectionChannelApi channelApi;
    private final String agentName;
    private String sessionId;

    private boolean readyState = false;
    private String channelPassword;
    Thread receiveThread;

    public boolean connect(String apiUrl, String channelName, String channelPassword) throws Exception {

        if (readyState && sessionId != null) {
            throw new Exception("Agent is " + agentName + " is already connected with session " + sessionId);
        }

        channelApi = ConnectionChannelApiFactory.getConnectionApi(apiUrl);
        ApiResponse connectResponse = channelApi.connect(channelName, channelPassword, this.agentName);

        if (connectResponse.status() == Status.SUCCESS) {

            JSONObject jsonObject = new JSONObject(connectResponse.data());
            this.sessionId = jsonObject.optString("sessionId");
            readyState = true;
            this.channelPassword = channelPassword;
            System.out.println("Connected to session : " + this.sessionId);
            return true;
        } else {
            System.out.println("Unable to connect: " + connectResponse.data());
            return false;
        }

    }

    public void disconnect() {

        if (!readyState) {
            System.out.println("Channel connection " + agentName + " is already disconnected.");
        }

        channelApi.disconnect(channelPassword, sessionId);

        sessionId = null;
        channelApi = null;
        readyState = false;
    }

    public String receive(String range) {

        if (!readyState || sessionId == null) {
            System.out.println("Channel is " + agentName + " is not ready ");
            return null;
        }

        ApiResponse revResponse = channelApi.receive(channelPassword, sessionId, range);

        if (revResponse.status() == Status.SUCCESS) {
            return revResponse.data();
        } else {
            System.out.println("Receive Error: " + revResponse.data());
            return null;
        }
    }

    public void receiveAsync(ChannelEventHandler messageHandler) throws Exception {

        if (receiveThread == null) {
            receiveThread = new Thread(new RunnableReceive(this, messageHandler));
            receiveThread.start();
        } else {
            System.out.println("Asynchronous receive is already running.");
        }

    }

    public boolean sendMessage(String msg, String destination) {
        return sendMessage(msg, ".*", false);
    }

    public boolean sendMessage(String msg) {
        return sendMessage(msg, ".*", true);
    }

    public boolean sendMessage(String msg, String destination, boolean asFilterRegex) {

        if (!readyState || sessionId == null) {
            System.out.println("Channel is " + agentName + " is not ready ");
            return false;
        }

        ApiResponse connectResponse = channelApi.send(msg, agentName, asFilterRegex ? destination : Pattern.quote(destination), channelPassword, sessionId);
        return connectResponse.status() == Status.SUCCESS;
    }

    public ConnectionChannel(String agentName) {
        this.agentName = agentName;
    }

    public static class RunnableReceive implements Runnable {

        private final ConnectionChannel channel;
        private final ChannelEventHandler messageHandler;

        public RunnableReceive(ConnectionChannel channel, ChannelEventHandler messageHandler) {
            this.channel = channel;
            this.messageHandler = messageHandler;
        }

        @Override
        public void run() {

            int size = 10;

            int start = 0;
            int end = start + size;

            while (channel.readyState) {

                String message = channel.receive(start + "-" + end);

                if (message != null) {

                    JSONArray events = new JSONArray(message);
                    messageHandler.onMessageEvents(events);

                    if (isExitEvent(events)) {
                        channel.disconnect();
                        break;
                    }

                    int dataLength = events.length();

                    start += dataLength;
                    end += dataLength;
                }


                Utils.sleep(500);

            }

        }

        private boolean isExitEvent(JSONArray events) {
            for (int i = 0; i < events.length(); i++) {
                if (events.getJSONObject(i).optString("content").equals(":exit")) {
                    return true;
                }
            }

            return false;

        }
    }



}
