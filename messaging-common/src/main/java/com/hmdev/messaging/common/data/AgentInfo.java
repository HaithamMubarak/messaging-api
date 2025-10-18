package com.hmdev.messaging.common.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentInfo {

    private String agentName;

    @JsonProperty("agentContext")
    private AgentContext agentContext;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentContext {
        private String agentType;
        private String descriptor;

        @JsonProperty("ip_address")
        private String ipAddress;
    }
}
