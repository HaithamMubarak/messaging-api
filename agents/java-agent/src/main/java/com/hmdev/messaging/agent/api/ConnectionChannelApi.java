package com.hmdev.messaging.agent.api;


import com.hmdev.messaging.agent.util.ApiResponse;

public interface ConnectionChannelApi {

    ApiResponse connect(String channelName, String channelKey, String agentName) throws Exception;

    ApiResponse connect(String channelName, String channelKey, String agentName, String sessionId) throws Exception;

    ApiResponse receive(String session, String range);

    ApiResponse getActiveAgents(String session);

    ApiResponse send(String msg, String destAgent, String session);

    ApiResponse disconnect(String session);

}