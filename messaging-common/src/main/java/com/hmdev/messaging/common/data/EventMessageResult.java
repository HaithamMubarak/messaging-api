package com.hmdev.messaging.common.data;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class EventMessageResult {

    private List<EventMessage> events;
    private long updateLength;

}
