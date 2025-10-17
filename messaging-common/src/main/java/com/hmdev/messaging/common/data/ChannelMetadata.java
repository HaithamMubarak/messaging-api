package com.hmdev.messaging.common.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Metadata returned after sending a message (topic name, etc.).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChannelMetadata {
    private String topicName;
    private String channelId;
}

