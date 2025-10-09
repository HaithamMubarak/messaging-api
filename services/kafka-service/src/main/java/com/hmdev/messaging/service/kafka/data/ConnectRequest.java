package com.hmdev.messaging.service.kafka.data;

import com.hmdev.messaging.common.data.AgentInfo;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectRequest extends SessionRequest {
    private String sessionId;
    private String channelName;
    private String channelPassword;
    private String agentName;
    private AgentInfo.AgentContext agentContext;
}
