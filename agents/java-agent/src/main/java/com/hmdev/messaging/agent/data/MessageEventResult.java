package com.hmdev.messaging.agent.data;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MessageEventResult {

    private List<MessageEvent> messageEvents;
    private long updateLength;

}
