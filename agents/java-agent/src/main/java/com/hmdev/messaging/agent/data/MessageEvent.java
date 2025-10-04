package com.hmdev.messaging.agent.data;

import lombok.Data;

@Data
public class MessageEvent {
    private long date;
    private String from;
    private String type;
    private String content;
}
