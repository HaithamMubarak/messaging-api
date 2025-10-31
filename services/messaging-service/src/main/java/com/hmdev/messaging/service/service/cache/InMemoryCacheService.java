package com.hmdev.messaging.service.service.cache;

import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.session.SessionInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * In-memory implementation of CacheService for demo/development mode.
 * Data is not persisted and will be lost on restart.
 */
@Service
public class InMemoryCacheService implements CacheService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InMemoryCacheService.class);

    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    private final Map<String, SessionInfo> sessions = new ConcurrentHashMap<>();
    private final Map<String, Map<Long, EventMessage>> channelMessages = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> channelCounters = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> channelSessions = new ConcurrentHashMap<>();

    @Override
    public <T> T getObject(String key, Class<T> clazz) {
        Object value = cache.get(key);
        if (value != null && clazz.isInstance(value)) {
            return clazz.cast(value);
        }
        return null;
    }

    @Override
    public void putObject(String key, Object object, Duration duration) {
        // In-memory implementation ignores TTL - objects persist until removed
        cache.put(key, object);
    }

    @Override
    public void removeObject(String key) {
        cache.remove(key);
    }

    @Override
    public SessionInfo getSessionInfo(String sessionId) {
        return sessions.get(sessionId);
    }

    @Override
    public void putSessionInfo(String sessionId, SessionInfo session) {
        sessions.put(sessionId, session);
    }

    @Override
    public void removeSessionInfo(String sessionId) {
        sessions.remove(sessionId);
    }

    @Override
    public void putEventMessage(String channelId, long channelOffset, EventMessage eventMessage) {
        channelMessages.computeIfAbsent(channelId, k -> new ConcurrentHashMap<>())
                .put(channelOffset, eventMessage);
    }

    @Override
    public EventMessage getEventMessage(String channelId, long channelOffset) {
        Map<Long, EventMessage> messages = channelMessages.get(channelId);
        return messages != null ? messages.get(channelOffset) : null;
    }

    @Override
    public long allocateLocalOffset(String channelId) {
        return channelCounters.computeIfAbsent(channelId, k -> new AtomicLong(0))
                .incrementAndGet();
    }

    @Override
    public void appendChannelSession(String channelId, String sessionId) {
        channelSessions.computeIfAbsent(channelId, k -> ConcurrentHashMap.newKeySet())
                .add(sessionId);
    }

    @Override
    public void removeChannelSession(String channelId, String sessionId) {
        Set<String> sessions = channelSessions.get(channelId);
        if (sessions != null) {
            sessions.remove(sessionId);
        }
    }

    @Override
    public Set<String> getSessionIdsByChannel(String channelId) {
        Set<String> sessions = channelSessions.get(channelId);
        return sessions != null ? new HashSet<>(sessions) : new HashSet<>();
    }

    @Override
    public Set<String> listChannelIds() {
        Set<String> channelIds = new HashSet<>();
        channelIds.addAll(channelMessages.keySet());
        channelIds.addAll(channelSessions.keySet());
        channelIds.addAll(channelCounters.keySet());
        return channelIds;
    }

    @Override
    public long countEventMessagesForChannel(String channelId) {
        Map<Long, EventMessage> messages = channelMessages.get(channelId);
        return messages != null ? messages.size() : 0;
    }

    @Override
    public List<EventMessage> getEventMessagesForChannel(String channelId, int limit) {
        Map<Long, EventMessage> messages = channelMessages.get(channelId);
        if (messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Return most recent messages first (sorted by offset descending)
        return messages.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getKey(), e1.getKey()))
                .limit(limit)
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
    }

    @Override
    public void removeChannel(String channelId) {
        // Remove all channel-related data
        channelMessages.remove(channelId);
        channelSessions.remove(channelId);
        channelCounters.remove(channelId);
        
        // Remove session objects for this channel's sessions
        Set<String> sessionIds = channelSessions.remove(channelId);
        if (sessionIds != null) {
            sessionIds.forEach(sessions::remove);
        }
    }

    @Override
    public void resetChannelCounter(String channelId) {
        AtomicLong counter = channelCounters.get(channelId);
        if (counter != null) {
            counter.set(0);
        }
    }

    @Override
    public Long peekChannelCounter(String channelId) {
        AtomicLong counter = channelCounters.get(channelId);
        return counter != null ? counter.get() : null;
    }
}
