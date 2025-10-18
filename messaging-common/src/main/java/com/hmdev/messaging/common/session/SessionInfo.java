package com.hmdev.messaging.common.session;

import com.hmdev.messaging.common.data.AgentInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionInfo {
    private String channelId;
    private AgentInfo agentInfo;
    private Long lastNextOffset;
    private Long lastSeenTime;
    private Long lastReadTime;
}
