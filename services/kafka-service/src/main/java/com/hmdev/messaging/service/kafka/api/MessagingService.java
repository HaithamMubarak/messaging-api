package com.hmdev.messaging.service.kafka.api;

import com.hmdev.messaging.service.kafka.model.ApiResponse;
import com.hmdev.messaging.service.kafka.model.ConnectRequest;
import com.hmdev.messaging.service.kafka.model.ConnectResponse;

import java.util.List;
import java.util.Map;

/**
 * Service interface defining the Messaging API operations.
 * 
 * This interface matches the Origin Service endpoints:
 * - connect: Agent connects to a channel
 * - active-agents: List active agents in the channel
 * - receive: Receive messages from the channel
 * - event: Send an event/message to the channel
 * - disconnect: Disconnect from the channel
 */
public interface MessagingService {
    
    /**
     * Connect an agent to a channel.
     * 
     * @param request Connection request with channel credentials and agent info
     * @return Connection response with session ID and channel ID
     */
    ApiResponse<ConnectResponse> connect(ConnectRequest request);
    
    /**
     * Get list of active agents in the channel.
     * 
     * @param sessionId The session ID from connect response
     * @return List of active agents with their contexts
     */
    ApiResponse<List<Map<String, Object>>> getActiveAgents(String sessionId);
    
    /**
     * Receive messages from the channel.
     * 
     * @param sessionId The session ID
     * @param range Message range to retrieve (e.g., "3-22")
     * @return Messages and events for the agent
     */
    ApiResponse<Map<String, Object>> receiveMessages(String sessionId, String range);
    
    /**
     * Send an event/message to the channel.
     * 
     * @param sessionId The session ID
     * @param event Event data to send
     * @return Success status
     */
    ApiResponse<Void> sendEvent(String sessionId, Map<String, Object> event);
    
    /**
     * Disconnect agent from the channel.
     * 
     * @param sessionId The session ID to disconnect
     * @return Success status
     */
    ApiResponse<Void> disconnect(String sessionId);
}
