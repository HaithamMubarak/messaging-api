package com.hmdev.messaging.common.service;


import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.data.Range;


public interface EventMessageService {

    /**
     * Sends a message to the channel.
     */
    void send(String channelId, EventMessage event);

    /**
     * Receives messages for a channel by offset range.
     */
    default EventMessageResult receive(String channelId, Range range)
    {
        return receive(channelId, null, range);
    }

    /**
     * Receives messages for a channel by source and offset range.
     */
    EventMessageResult receive(String channelId, String toDest, Range range);

    /**
     * Cleans the channel related resources
     */
    boolean clean(String channelId);
}
