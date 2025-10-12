package com.hmdev.messaging.service.kafka.data;


import com.hmdev.messaging.common.data.EventMessage;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventMessageRequest extends EventMessage {

    private String sessionId;

}
