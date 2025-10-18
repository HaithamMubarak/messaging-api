package com.hmdev.messaging.service.kafka.cache;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for cache prefixes and TTLs.
 */
@Getter
@Component
@ConfigurationProperties(prefix = "messaging.cache")
public class CacheProperties {

    @Setter
    private String sessionPrefix = CacheKeys.SESSION_PREFIX;
    @Setter
    private int sessionTtlSeconds = CacheKeys.SESSION_TTL_SECONDS;

    @Setter
    private String kafkaMsgPrefix = CacheKeys.KAFKA_MSG_PREFIX;
    @Setter
    private int kafkaMessageTtlSeconds = CacheKeys.KAFKA_MESSAGE_TTL_SECONDS;

    public int getKafkaMessageMaxCount() {
        return 100;
    }
}

