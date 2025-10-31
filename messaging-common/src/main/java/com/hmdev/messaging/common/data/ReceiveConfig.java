package com.hmdev.messaging.common.data;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReceiveConfig {
    private Long globalOffset;
    private Long localOffset;
    private Long limit;

    @JsonProperty("pollSource")
    @JsonAlias({"source"})
    private PollSource pollSource = PollSource.AUTO;

    private boolean pollingDisabled;

    // Keep compatibility with existing constructor usages: (globalOffset, localOffset, limit)
    public ReceiveConfig(Long globalOffset, Long localOffset, Long limit) {
        this.globalOffset = globalOffset;
        this.localOffset = localOffset;
        this.limit = limit;
    }

    // Optional full constructor if callers need to specify pollSource explicitly
    public ReceiveConfig(Long globalOffset, Long localOffset, Long limit, PollSource pollSource) {
        this.globalOffset = globalOffset;
        this.localOffset = localOffset;
        this.limit = limit;
        this.pollSource = pollSource == null ? PollSource.AUTO : pollSource;
    }
}

