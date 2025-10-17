package com.hmdev.messaging.service.kafka.model;

import java.util.Map;

/**
 * Request model for agent connection.
 */
public class ConnectRequest {
    
    private String channelName;
    private String channelPassword;
    private String agentName;
    private Map<String, Object> agentContext;
    
    public String getChannelName() {
        return channelName;
    }
    
    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }
    
    public String getChannelPassword() {
        return channelPassword;
    }
    
    public void setChannelPassword(String channelPassword) {
        this.channelPassword = channelPassword;
    }
    
    public String getAgentName() {
        return agentName;
    }
    
    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }
    
    public Map<String, Object> getAgentContext() {
        return agentContext;
    }
    
    public void setAgentContext(Map<String, Object> agentContext) {
        this.agentContext = agentContext;
    }
}
