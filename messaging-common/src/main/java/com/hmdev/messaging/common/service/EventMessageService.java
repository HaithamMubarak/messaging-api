package com.hmdev.messaging.common.service;


import com.hmdev.messaging.common.data.*;


public interface EventMessageService<C> {

    /**
     * Sends a message to the channel and returns metadata about the send (channel id , topic, etc.).
     */
    ChannelMetadata send(String channelId, EventMessage event);

    /**
     * Receives messages for a channel by receive config.
     */
    default EventMessageResult receive(String channelId, ReceiveConfig receiveConfig) {
        return receive(channelId, null, receiveConfig);
    }

    C createChannel(String channelId, String devApiKey, String channelName, String channelPassword);

    /**
     * Receives messages for a channel by recipient and receive config.
     */
    EventMessageResult receive(String channelId, String recipientName, ReceiveConfig receiveConfig);

    /**
     * Delete a channel entirely: remove DB record, cached state, and (where supported) the underlying topic/messages.
     * Implementations must validate the developer API key (devApiKey) and ensure only authorized callers can delete.
     * Return true when deletion completed (or topic deletion is supported and succeeded), false otherwise.
     */
    boolean deleteChannel(String channelId, String devApiKey);

    /**
     * Return current offsets info for admin inspection without making changes.
     * Implementations can return cache counter, DB metadata offsets and an observed kafka last offset.
     * Default is unsupported.
     */
    default com.hmdev.messaging.common.data.ChannelOffsetInfo peekChannelOffsets(String channelId) {
        throw new UnsupportedOperationException("peekChannelOffsets not supported by this implementation");
    }

}
