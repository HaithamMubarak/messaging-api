package com.hmdev.messaging.service.service.cache;

import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.session.SessionInfo;

import java.time.Duration;
import java.util.List;
import java.util.Set;

/**
 * CacheService defines the caching operations used by the kafka service.
 * and TTL handling.
 */
public interface CacheService {

    <T> T getObject(String key, Class<T> clazz);

    void putObject(String key, Object object, Duration duration);

    void removeObject(String key);

    SessionInfo getSessionInfo(String sessionId);

    void putSessionInfo(String sessionId, SessionInfo session);

    void removeSessionInfo(String sessionId);

    void putEventMessage(String channelId, long channelOffset, EventMessage eventMessage);

    EventMessage getEventMessage(String channelId, long channelOffset);

    /**
     * Allocate (atomically increment) a per-channel local offset counter and return the new value.
     * This counter is intended to be permanent (no TTL) so that local offsets survive restarts.
     */
    long allocateLocalOffset(String channelId);

    /**
     * Add a sessionId (agent) to the channel's sessions set in cache. Implementations should
     * ensure the set TTL is refreshed appropriately (e.g. to session TTL).
     */
    void appendChannelSession(String channelId, String sessionId);

    /**
     * Remove a sessionId (agent) from the channel's sessions set in cache.
     */
    void removeChannelSession(String channelId, String sessionId);

    /**
     * Return all session ids stored in the channel's sessions set in cache.
     * Implementations may refresh the set TTL when reading.
     */
    Set<String> getSessionIdsByChannel(String channelId);

    // --- Administrative helpers ---

    /**
     * List all known channel ids found in cache (for example by scanning channel offset keys).
     */
    Set<String> listChannelIds();

    /**
     * Return approximate count of cached event messages for a given channel (by scanning keys).
     */
    long countEventMessagesForChannel(String channelId);

    /**
     * Return recent cached event messages for a channel (most recent first) up to limit.
     */
    List<EventMessage> getEventMessagesForChannel(String channelId, int limit);

    /**
     * Server-side paging: return messages starting at offset (0-based) with max limit.
     * Default implementation calls the existing limit-based method and slices the result.
     */
    default List<EventMessage> getEventMessagesForChannel(String channelId, int offset, int limit) {
        if (limit <= 0) return java.util.Collections.emptyList();
        List<EventMessage> all = getEventMessagesForChannel(channelId, offset + limit);
        if (all == null || all.isEmpty()) return java.util.Collections.emptyList();
        if (offset >= all.size()) return java.util.Collections.emptyList();
        int to = Math.min(all.size(), offset + limit);
        return all.subList(offset, to);
    }

    /**
     * Remove all cache entries related to a channel including sessions set, session objects,
     * per-channel counter and cached event messages.
     */
    void removeChannel(String channelId);

    /**
     * Reset or remove the per-channel local offset counter so that allocated offsets start over.
     * Implementations should remove the counter key or set it back to zero.
     */
    void resetChannelCounter(String channelId);

    /**
     * Peek current channel local offset counter without incrementing it. Returns null when unknown.
     */
    Long peekChannelCounter(String channelId);

}
