package com.hmdev.messaging.common.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventMessage {
    private String from;
    private String type;
    private boolean encrypted;
    private String content;
    private long date;
}
