package com.hmdev.messaging.agent.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AgentRecord {
    private long date;

    @JsonProperty("agentContext")
    private AgentContext agentContext;

    private String agentName;

    @Data
    public static class AgentContext {
        private String agentType;
        private String descriptor;

        @JsonProperty("ip_address")
        private String ipAddress;
    }
}
