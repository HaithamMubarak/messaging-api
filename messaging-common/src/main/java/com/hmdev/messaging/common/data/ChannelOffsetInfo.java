package com.hmdev.messaging.common.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChannelOffsetInfo {
    private String channelId;
    private Long cacheLocalCounter; // current value from cache counter (next allocated value)
    private Long dbLocalOffset;     // localOffset from DB metadata
    private Long dbGlobalOffset;    // globalOffset from DB metadata
    private Long kafkaLastOffset;   // last offset observed from Kafka (end-1)
}

