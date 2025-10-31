package com.hmdev.messaging.common.data;

import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectRequest extends SessionRequest {
    private String channelId; // optional: pre-derived channel id
    private String channelName;
    private String channelPassword;
    private String agentName;
    private AgentInfo.AgentContext agentContext;
}
