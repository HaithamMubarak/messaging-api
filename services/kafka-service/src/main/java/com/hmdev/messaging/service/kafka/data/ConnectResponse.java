package com.hmdev.messaging.service.kafka.data;

import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectResponse extends SessionRequest {
    private String channelId;
    private long date;
}
