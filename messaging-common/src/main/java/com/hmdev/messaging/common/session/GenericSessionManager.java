package com.hmdev.messaging.common.session;

import java.util.Map;

/**
 * Generic session manager contract.
 * Implementations can use Kafka, Redis, in-memory, etc.
 */
public interface GenericSessionManager {

    /**
     * Store or update a session mapping.
     */
    <T> boolean put(String sessionId, T data);

    /**
     * Retrieve a session mapping (from cache or backend).
     */
    <T> T get(String sessionId, Class<T> type);

    /**
     * Remove a session mapping.
     */
    boolean remove(String sessionId);

    /**
     * For diagnostics — returns cached session snapshot.
     */
    Map<String, Object> getAllCached();
}
