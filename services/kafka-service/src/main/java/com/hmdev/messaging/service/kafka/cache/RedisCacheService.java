package com.hmdev.messaging.service.kafka.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Redis-backed implementation of CacheService.
 * Stores JSON-serialized values using StringRedisTemplate and applies configured TTLs.
 */
@Service
public class RedisCacheService implements CacheService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RedisCacheService.class);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final CacheProperties cacheProperties;

    @Autowired
    public RedisCacheService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper, CacheProperties cacheProperties) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.cacheProperties = cacheProperties;
    }

    @Override
    public <T> T getSession(String sessionId, Class<T> clazz) {
        String key = cacheProperties.getSessionPrefix() + sessionId;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            LOGGER.warn("Failed to deserialize session {} from redis: {}", sessionId, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public void putSession(String sessionId, Object session) {
        String key = cacheProperties.getSessionPrefix() + sessionId;
        try {
            String json = objectMapper.writeValueAsString(session);
            redisTemplate.opsForValue().set(key, json, Duration.ofSeconds(cacheProperties.getSessionTtlSeconds()));
        } catch (Exception e) {
            LOGGER.warn("Failed to put session {} into redis: {}", sessionId, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public void remove(String sessionId) {
        String key = cacheProperties.getSessionPrefix() + sessionId;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            LOGGER.warn("Failed to evict session {} from redis: {}", sessionId, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public void evictSession(String sessionId) {
        // delegate to remove for backward compatibility
        remove(sessionId);
    }

    @Override
    public void putKafkaMessage(String cacheKey, Object message) {
        String key = cacheProperties.getKafkaMsgPrefix() + cacheKey;
        try {
            String json = objectMapper.writeValueAsString(message);

            // Push message to list
            redisTemplate.opsForList().rightPush(key, json);

            // Optionally limit list size (keep last N messages)
            int maxMessages = cacheProperties.getKafkaMessageMaxCount();
            if (maxMessages > 0) {
                redisTemplate.opsForList().trim(key, -maxMessages, -1);
            }

            // Refresh TTL (for idle expiration behavior)
            redisTemplate.expire(key, Duration.ofSeconds(cacheProperties.getKafkaMessageTtlSeconds()));
        } catch (Exception e) {
            LOGGER.warn("Failed to put kafka message {} into redis: {}", cacheKey, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public <T> List<T> getKafkaMessages(String cacheKey, Class<T> clazz) {
        String key = cacheProperties.getKafkaMsgPrefix() + cacheKey;
        List<String> jsonList = redisTemplate.opsForList().range(key, 0, -1);

        if (jsonList == null || jsonList.isEmpty()) return Collections.emptyList();

        List<T> result = new ArrayList<>();
        for (String json : jsonList) {
            try {
                result.add(objectMapper.readValue(json, clazz));
            } catch (Exception e) {
                LOGGER.warn("Failed to deserialize message for {}: {}", cacheKey, e.getMessage());
            }
        }
        return result;
    }
}
