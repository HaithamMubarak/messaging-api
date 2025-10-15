package com.hmdev.messaging.service.kafka.service.provider;


import com.hmdev.messaging.common.data.Pair;

public interface IChannelTopicProvider {

    Pair<String, String> resolveTopic(String channelId, ChannelType channelType);

    default Pair<String, String> resolveTopic(String channelId) {
        return resolveTopic(channelId, ChannelType.DEFAULT);
    }
}
