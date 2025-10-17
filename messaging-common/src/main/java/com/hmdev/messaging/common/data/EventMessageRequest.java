package com.hmdev.messaging.common.data;


import lombok.*;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@SuperBuilder
public class EventMessageRequest extends EventMessage {
    private String sessionId;
}
