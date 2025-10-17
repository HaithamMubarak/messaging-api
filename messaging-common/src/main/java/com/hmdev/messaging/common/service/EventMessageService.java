package com.hmdev.messaging.common.service;


import com.hmdev.messaging.common.data.*;

public interface EventMessageService {

    /**
     * Gets metadata about the channel (topic name, etc.).
     */
    ChannelMetadata getChannelMetdata(String channelId, ChannelType channelType);

    /**
     * Sends a message to the channel and returns metadata about the send (channel id , topic, etc.).
     */
    ChannelMetadata send(String channelId, EventMessage event);

    /**
     * Receives messages for a channel by offset range.
     */
    default EventMessageResult receive(String channelId, OffsetRange offsetRange) {
        return receive(channelId, null, offsetRange);
    }

    /**
     * Receives messages for a channel by source and offset range.
     */
    EventMessageResult receive(String channelId, String recipientName, OffsetRange offsetRange);

}
