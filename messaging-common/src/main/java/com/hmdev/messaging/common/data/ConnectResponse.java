package com.hmdev.messaging.common.data;

import lombok.*;


@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectResponse extends SessionRequest {
    private String channelId;
    private long date;

    @Builder.Default
    private ChannelMetadata metadata = new ChannelMetadata();
}
