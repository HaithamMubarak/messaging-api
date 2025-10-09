package com.hmdev.messaging.service.kafka.data;

import com.hmdev.messaging.common.data.Range;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReceiveRequest extends SessionRequest {
    private String sessionId;

    private Range range;
}
