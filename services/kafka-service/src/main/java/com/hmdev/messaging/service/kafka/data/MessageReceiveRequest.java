package com.hmdev.messaging.service.kafka.data;

import com.hmdev.messaging.common.data.OffsetRange;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReceiveRequest extends SessionRequest {
    private OffsetRange offsetRange;
}
