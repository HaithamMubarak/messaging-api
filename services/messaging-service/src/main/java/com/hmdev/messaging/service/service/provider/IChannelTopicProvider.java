package com.hmdev.messaging.service.service.provider;


import com.hmdev.messaging.common.data.ChannelType;
import com.hmdev.messaging.common.data.ChannelMetadata;

public interface IChannelTopicProvider {

    ChannelMetadata resolveTopic(String channelId, ChannelType channelType);

    default ChannelMetadata resolveTopic(String channelId) {
        return resolveTopic(channelId, ChannelType.DEFAULT);
    }

    /**
     * Delete a Kafka topic by name. Implementations may choose to support or no-op.
     * Return true if deletion succeeded.
     */
    default boolean deleteTopic(String topicName) {
        return false;
    }
}
