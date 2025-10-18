package com.hmdev.messaging.common.data;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventMessageResult {
    private List<EventMessage> events;
    private Long nextOffset;
}
