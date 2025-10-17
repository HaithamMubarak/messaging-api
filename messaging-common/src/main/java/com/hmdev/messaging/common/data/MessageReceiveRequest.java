package com.hmdev.messaging.common.data;

import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReceiveRequest extends SessionRequest {
    private OffsetRange offsetRange;
}
