package com.hmdev.messaging.service.kafka.data;


import lombok.Data;

@Data
public class EventMessageRequest {
    private String type;
    private String to;
    private boolean encrypted;
    private String content;
    private String sessionId;
}
