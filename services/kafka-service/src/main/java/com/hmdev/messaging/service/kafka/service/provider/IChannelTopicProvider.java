package com.hmdev.messaging.service.kafka.service.provider;


import com.hmdev.messaging.common.data.ChannelType;
import com.hmdev.messaging.common.data.ChannelMetadata;

public interface IChannelTopicProvider {

    ChannelMetadata resolveTopic(String channelId, ChannelType channelType);

    default ChannelMetadata resolveTopic(String channelId) {
        return resolveTopic(channelId, ChannelType.DEFAULT);
    }
}
