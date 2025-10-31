package com.hmdev.messaging.service.service.cache;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.lang.Nullable;

/**
 * Configuration properties for cache prefixes and TTLs.
 * This class also exposes the legacy constant defaults as public static fields so code/tests
 * can reference defaults without requiring an application context. Instance properties are
 * bound via constructor binding and are read-only (getters only).
 */
@Getter
@ConfigurationProperties(prefix = "messaging.cache")
@ConstructorBinding
public class CacheProperties {
    /**
     * Default properties values for caching
     */
    public static final String DEFAULT_SESSION_PREFIX = "session:";
    public static final int DEFAULT_SESSION_TTL_SECONDS = 1800; // 30 minutes
    public static final String DEFAULT_KAFKA_MSG_PREFIX = "kafka_msg:";
    public static final int DEFAULT_KAFKA_MESSAGE_TTL_SECONDS = 300; // 5 minutes
    public static final String DEFAULT_CHANNEL_SESSIONS_PREFIX = "channel_session:";
    public static final String DEFAULT_CHANNEL_OFFSET_COUNTER_PREFIX = "channel_offset_counter:";

    private final String sessionPrefix;
    private final int sessionTtlSeconds;
    private final String eventMsgPrefix;
    private final int kafkaMessageTtlSeconds;
    private final String channelSessionsPrefix;
    private final String channelOffsetCounterPrefix;
    private final int kafkaMessageMaxCount;

    public CacheProperties(@Nullable String sessionPrefix,
                           @Nullable Integer sessionTtlSeconds,
                           @Nullable String eventMsgPrefix,
                           @Nullable Integer kafkaMessageTtlSeconds,
                           @Nullable String channelSessionsPrefix,
                           @Nullable String channelOffsetCounterPrefix,
                           @Nullable Integer kafkaMessageMaxCount) {
        this.sessionPrefix = (sessionPrefix != null) ? sessionPrefix : DEFAULT_SESSION_PREFIX;
        this.sessionTtlSeconds = (sessionTtlSeconds != null) ? sessionTtlSeconds : DEFAULT_SESSION_TTL_SECONDS;
        this.eventMsgPrefix = (eventMsgPrefix != null) ? eventMsgPrefix : DEFAULT_KAFKA_MSG_PREFIX;
        this.kafkaMessageTtlSeconds = (kafkaMessageTtlSeconds != null) ? kafkaMessageTtlSeconds : DEFAULT_KAFKA_MESSAGE_TTL_SECONDS;
        this.channelSessionsPrefix = (channelSessionsPrefix != null) ? channelSessionsPrefix : DEFAULT_CHANNEL_SESSIONS_PREFIX;
        this.channelOffsetCounterPrefix = (channelOffsetCounterPrefix != null) ? channelOffsetCounterPrefix : DEFAULT_CHANNEL_OFFSET_COUNTER_PREFIX;
        this.kafkaMessageMaxCount = (kafkaMessageMaxCount != null) ? kafkaMessageMaxCount : 100;
    }
}
