package com.hmdev.messaging.agent.api;

import com.hmdev.messaging.common.data.*;

import java.util.List;

public interface ConnectionChannelApi {

    String getChannelSecret();

    void setChannelSecret(String channelSecret);

    ConnectResponse connect(String channelName, String channelKey, String agentName);

    ConnectResponse connect(String channelName, String channelKey, String agentName, String sessionId);

    // New overloads: connect using server-side channelId directly
    ConnectResponse connect(String channelName, String channelKey, String agentName, String sessionId, String channelId);

    ConnectResponse connectWithChannelId (String agentName,String channelId, String sessionId);

    EventMessageResult receive(String session, ReceiveConfig receiveConfig);

    List<AgentInfo> getActiveAgents(String session);

    boolean send( String msg, String destAgent, String session);

    boolean send(EventMessage.EventType eventType, String msg, String destAgent, String session, boolean encrypted);

    boolean disconnect(String session);

}