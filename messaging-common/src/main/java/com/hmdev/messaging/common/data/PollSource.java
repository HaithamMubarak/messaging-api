package com.hmdev.messaging.common.data;

/**
 * Controls where to poll messages from.
 */
public enum PollSource {
    CACHE,
    KAFKA,
    AUTO;

    public boolean isCacheEnabled() {
        return this == AUTO || this == CACHE;
    }

    public boolean isKafkaEnabled() {
        return this == AUTO || this == KAFKA;
    }

}
