package com.hmdev.messaging.service.kafka.model;

/**
 * Response model for successful connection.
 */
public class ConnectResponse {
    
    private String channelId;
    private String sessionId;
    private String role;
    private long date;
    
    public ConnectResponse() {
    }
    
    public ConnectResponse(String channelId, String sessionId, String role, long date) {
        this.channelId = channelId;
        this.sessionId = sessionId;
        this.role = role;
        this.date = date;
    }
    
    public String getChannelId() {
        return channelId;
    }
    
    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public long getDate() {
        return date;
    }
    
    public void setDate(long date) {
        this.date = date;
    }
}
