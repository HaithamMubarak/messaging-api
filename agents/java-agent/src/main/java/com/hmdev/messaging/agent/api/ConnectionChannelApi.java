package com.hmdev.messaging.agent.api;

import com.hmdev.messaging.common.HttpClientResult;
import com.hmdev.messaging.common.data.AgentInfo;
import com.hmdev.messaging.common.data.ConnectResponse;
import com.hmdev.messaging.common.data.EventMessageResult;

import java.util.List;

public interface ConnectionChannelApi {

    ConnectResponse connect(String channelName, String channelKey, String agentName);

    ConnectResponse connect(String channelName, String channelKey, String agentName, String sessionId);

    EventMessageResult receive(String session, long startOffset, long limit);

    List<AgentInfo> getActiveAgents(String session);

    boolean send(String msg, String destAgent, String session);

    boolean disconnect(String session);

}