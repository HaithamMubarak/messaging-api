package com.hmdev.messaging.service.kafka.session;

import com.hmdev.messaging.common.data.AgentInfo;
import com.hmdev.messaging.common.session.GenericSessionManager;
import com.hmdev.messaging.common.session.SessionInfo;
import com.hmdev.messaging.service.kafka.cache.CacheProperties;
import com.hmdev.messaging.service.kafka.cache.CacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Redis-backed session manager. Stores session JSON and maintains a Redis set of session IDs per channel.
 */
@Service
public class RedisSessionManager implements GenericSessionManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(RedisSessionManager.class);

    private final CacheService cacheService;
    private final StringRedisTemplate redisTemplate;
    private final CacheProperties cacheProperties;

    public RedisSessionManager(CacheService cacheService, StringRedisTemplate redisTemplate, CacheProperties cacheProperties) {
        this.cacheService = cacheService;
        this.redisTemplate = redisTemplate;
        this.cacheProperties = cacheProperties;
    }

    @Override
    public void putSession(String sessionId, SessionInfo info) {
        try {
            // If there was a previous session, remove it from its channel set if channel changed
            SessionInfo old = cacheService.getSession(sessionId, SessionInfo.class);
            if (old != null && !old.getChannelId().equals(info.getChannelId())) {
                String oldSet = cacheProperties.getChannelSessionsPrefix() + old.getChannelId();
                redisTemplate.opsForSet().remove(oldSet, sessionId);
            }
        } catch (Exception e) {
            LOGGER.debug("Failed to read old session {} from cache: {}", sessionId, e.getMessage());
        }

        try {
            cacheService.putSession(sessionId, info);
        } catch (Exception e) {
            LOGGER.error("Failed to put session {} into cache: {}", sessionId, e.getMessage());
        }

        // Add sessionId to channel set
        String setKey = cacheProperties.getChannelSessionsPrefix() + info.getChannelId();
        try {
            redisTemplate.opsForSet().add(setKey, sessionId);
            // refresh TTL on the set to match session TTL
            redisTemplate.expire(setKey, Duration.ofSeconds(cacheProperties.getSessionTtlSeconds()));
        } catch (Exception e) {
            LOGGER.warn("Failed to update channel session set {}: {}", setKey, e.getMessage());
        }

        LOGGER.debug("Session stored in Redis: {} -> channel {}", sessionId, info.getChannelId());
    }

    @Override
    public SessionInfo getSession(String sessionId) {
        try {
            SessionInfo sessionInfo = cacheService.getSession(sessionId, SessionInfo.class);
            if (sessionInfo != null) {
                // refresh TTL for the session key when accessed (sliding TTL)
                try {
                    String key = cacheProperties.getSessionPrefix() + sessionId;
                    redisTemplate.expire(key, Duration.ofSeconds(cacheProperties.getSessionTtlSeconds()));
                } catch (Exception e) {
                    LOGGER.debug("Failed to refresh TTL for session {}: {}", sessionId, e.getMessage());
                }
            }
            return sessionInfo;
        } catch (Exception e) {
            LOGGER.warn("Failed to get session {} from cache: {}", sessionId, e.getMessage());
            return null;
        }
    }

    @Override
    public List<AgentInfo> getAgentsByChannel(String channelId) {
        String setKey = cacheProperties.getChannelSessionsPrefix() + channelId;
        try {
            Set<String> members = redisTemplate.opsForSet().members(setKey);
            if (members == null || members.isEmpty()) return new ArrayList<>();
            List<AgentInfo> result = members.stream().map(sessionId -> {
                try {
                    SessionInfo sessionInfo = cacheService.getSession(sessionId, SessionInfo.class);
                    if (sessionInfo == null) {
                        // remove stale sessionId from the set
                        try {
                            redisTemplate.opsForSet().remove(setKey, sessionId);
                        } catch (Exception ex) {
                            LOGGER.debug("Failed to remove stale session {} from set {}: {}", sessionId, setKey, ex.getMessage());
                        }
                        return null;
                    }
                    return sessionInfo.getAgentInfo();
                } catch (Exception e) {
                    LOGGER.debug("Failed to read session {} while listing channel {}: {}", sessionId, channelId, e.getMessage());
                    return null;
                }
            }).filter(Objects::nonNull).collect(Collectors.toList());

            // refresh TTL on channel set when listing
            try {
                redisTemplate.expire(setKey, Duration.ofSeconds(cacheProperties.getSessionTtlSeconds()));
            } catch (Exception ex) {
                LOGGER.debug("Failed to refresh TTL for set {}: {}", setKey, ex.getMessage());
            }

            return result;
        } catch (Exception e) {
            LOGGER.warn("Failed to get members of {}: {}", setKey, e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public void removeSession(String sessionId) {
        try {
            SessionInfo si = cacheService.getSession(sessionId, SessionInfo.class);
            cacheService.remove(sessionId);
            if (si != null) {
                String setKey = cacheProperties.getChannelSessionsPrefix() + si.getChannelId();
                redisTemplate.opsForSet().remove(setKey, sessionId);
            }
        } catch (Exception e) {
            LOGGER.warn("Failed to remove session {} from cache: {}", sessionId, e.getMessage());
        }

        LOGGER.debug("Session removed from Redis: {}", sessionId);
    }
}
