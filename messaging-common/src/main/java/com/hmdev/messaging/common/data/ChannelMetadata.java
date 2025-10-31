package com.hmdev.messaging.common.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Metadata returned after sending a message (topic name, etc.).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChannelMetadata {
    private String topicName;
    private String channelId;
    private String channelName;
    private String channelPassword;
    private Long globalOffset;
    private Long localOffset;

    private boolean publicChannel = false;
    private List<String> allowedAgentsNames = new ArrayList<>();

    // Backwards-compatible constructor used in many places before channelName/password were added
    public ChannelMetadata(String topicName, String channelId) {
        this.topicName = topicName;
        this.channelId = channelId;
        this.channelName = null;
        this.channelPassword = null;
        this.globalOffset = null;
        this.localOffset = null;
    }
}
