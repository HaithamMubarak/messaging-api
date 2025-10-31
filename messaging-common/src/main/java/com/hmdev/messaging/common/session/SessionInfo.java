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
    private String sessionId;
    private AgentInfo agentInfo;
    private Long globalOffset;
    private Long localOffset;
    private Long lastSeenTime;
    private Long lastReadTime;
}
