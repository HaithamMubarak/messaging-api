package com.hmdev.messaging.service.kafka.cache;

import java.util.List;

/**
 * CacheService defines the caching operations used by the kafka service.
 * Implementations (for example Redis-backed) should provide JSON (de)serialization
 * and TTL handling.
 */
public interface CacheService {

    <T> T getSession(String sessionId, Class<T> clazz) throws Exception;

    void putSession(String sessionId, Object session) throws Exception;

    // remove is kept for backward compatibility; evictSession is the preferred name
    void remove(String sessionId) throws Exception;

    void evictSession(String sessionId) throws Exception;

    void putKafkaMessage(String cacheKey, Object message) throws Exception;

    <T> List<T> getKafkaMessages(String cacheKey, Class<T> clazz) throws Exception;

    // Convenience: return the last (most recent) kafka message for the key, or null if none
    default <T> T getKafkaMessage(String cacheKey, Class<T> clazz) throws Exception {
        List<T> list = getKafkaMessages(cacheKey, clazz);
        if (list == null || list.isEmpty()) return null;
        return list.get(list.size() - 1);
    }
}
