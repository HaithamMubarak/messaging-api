package com.hmdev.messaging.service.kafka.cache;

/**
 * CacheKeys contains Redis key prefixes and TTL values used by the kafka-service cache.
 *
 * Assumptions:
 * - Session TTL is set to 30 minutes (1800 seconds) to keep session quick-access cached
 *   while allowing eventual expiration for inactive agents.
 * - Kafka message TTL is set to 5 minutes (300 seconds) as used by KafkaMessageService comment.
 */
public final class CacheKeys {

    private CacheKeys() {}

    public static final String SESSION_PREFIX = "session:";
    public static final int SESSION_TTL_SECONDS = 1800; // 30 minutes

    public static final String KAFKA_MSG_PREFIX = "kafka_msg:";
    public static final int KAFKA_MESSAGE_TTL_SECONDS = 300; // 5 minutes

    // Prefix for storing set of session IDs for a given channel
    public static final String CHANNEL_SESSIONS_PREFIX = "channel_sess:";

}
