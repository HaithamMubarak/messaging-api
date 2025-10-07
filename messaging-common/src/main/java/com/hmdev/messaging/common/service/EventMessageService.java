package com.hmdev.messaging.common.service;


import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;


public interface EventMessageService {

    /**
     * Sends a message to the channel.
     */
    void send(String channelId, EventMessage event);

    /**
     * Receives messages for a channel by offset range.
     */
    default EventMessageResult receive(String channelId, long startOffset, long endOffset)
    {
        return receive(channelId, null, startOffset, endOffset);
    }

    /**
     * Receives messages for a channel by source and offset range.
     */
    EventMessageResult receive(String channelId, String from, long startOffset, long endOffset);

    /**
     * Cleans the channel related resources
     */
    boolean clean(String channelId);
}
