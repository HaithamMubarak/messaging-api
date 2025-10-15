package com.hmdev.messaging.common.service;


import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.data.OffsetRange;


public interface EventMessageService {

    /**
     * Sends a message to the channel.
     */
    void send(String channelId, EventMessage event);

    /**
     * Receives messages for a channel by offset range.
     */
    default EventMessageResult receive(String channelId, OffsetRange offsetRange)
    {
        return receive(channelId, null, offsetRange);
    }

    /**
     * Receives messages for a channel by source and offset range.
     */
    EventMessageResult receive(String channelId, String recipientName, OffsetRange offsetRange);

}
