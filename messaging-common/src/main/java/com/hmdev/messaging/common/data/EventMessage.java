package com.hmdev.messaging.common.data;

import lombok.Data;

@Data
public class EventMessage {
    private long date;
    private String from;
    private String type;
    private String content;
}
