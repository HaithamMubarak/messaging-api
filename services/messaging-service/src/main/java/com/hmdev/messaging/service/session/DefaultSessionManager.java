package com.hmdev.messaging.service.session;

import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.session.GenericSessionManager;
import com.hmdev.messaging.common.session.SessionInfo;
import com.hmdev.messaging.service.service.cache.CacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * default-backed session manager. Stores session JSON and maintains a set of session IDs per channel.
 */
@Service
public class DefaultSessionManager implements GenericSessionManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultSessionManager.class);

    private final CacheService cacheService;

    public DefaultSessionManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @Override
    public void putSession(String sessionId, SessionInfo updatedSession) {
        try {
            updatedSession.setSessionId(sessionId);
            cacheService.putSessionInfo(sessionId, updatedSession);

            // Remove other sessions of the same agent in the channel if needed (e.g. in case of re-connect)
            String channelId = updatedSession.getChannelId();
            String agentName = updatedSession.getAgentInfo().getAgentName();

            List<SessionInfo> channelSessions = getSessionsByChannel(channelId);

            // Find duplicate sessions for the same agent (excluding the current session)
            Set<String> duplicateSessionIds = channelSessions.stream()
                    .filter(session -> !session.getSessionId().equals(sessionId))
                    .filter(session -> session.getAgentInfo().getAgentName().equals(agentName))
                    .map(SessionInfo::getSessionId)
                    .collect(Collectors.toSet());

            if (!duplicateSessionIds.isEmpty()) {
                duplicateSessionIds.forEach(cacheService::removeSessionInfo);
            }

            // Append new session ID to channel’s session set if not already present
            boolean isAlreadyInChannel = channelSessions.stream()
                    .anyMatch(session -> session.getSessionId().equals(sessionId));

            if (!isAlreadyInChannel) {
                cacheService.appendChannelSession(channelId, sessionId);
            }

            LOGGER.debug("Session stored in cache: {} -> channel {}", sessionId, channelId);

        } catch (Exception e) {
            LOGGER.error("Exception while putting session {} into cache", sessionId, e);
            throw new RuntimeException("Failed to put session into cache: " + e.getMessage(), e);
        }
    }

    @Override
    public SessionInfo getSession(String sessionId) {
        try {
            return cacheService.getSessionInfo(sessionId);
        } catch (Exception e) {
            LOGGER.error("Exception while getting session {}: {}", sessionId, e.getMessage());
            throw new RuntimeException("Failed to get session: " + e.getMessage());
        }
    }

    @Override
    public List<SessionInfo> getSessionsByChannel(String channelId) {
        try {
            Set<String> sessionIds = cacheService.getSessionIdsByChannel(channelId);
            if (CommonUtils.isEmpty(sessionIds)) {
                return new ArrayList<>();
            } else {
                // Build list and perform lazy cleanup: remove session ids that no longer have a session object
                List<SessionInfo> sessions = new ArrayList<>();
                for (String sid : sessionIds) {
                    try {
                        SessionInfo sessionInfo = cacheService.getSessionInfo(sid);
                        if (sessionInfo != null) {
                            sessions.add(sessionInfo);
                        } else {
                            // Session object missing (likely expired) - remove from channel set
                            try {
                                cacheService.removeChannelSession(channelId, sid);
                                LOGGER.debug("Removed stale session id {} from channel {}", sid, channelId);
                            } catch (Exception ex) {
                                LOGGER.warn("Failed to remove stale session id {} from channel {}: {}", sid, channelId, ex.getMessage());
                            }
                        }
                    } catch (Exception e) {
                        LOGGER.warn("Error while reading session {} for channel {}: {}", sid, channelId, e.getMessage());
                    }
                }

                return sessions;

            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to get agents by channel: " + e.getMessage());
        }
    }

    @Override
    public void removeSession(String sessionId) {
        try {
            SessionInfo sessionInfo = cacheService.getSessionInfo(sessionId);
            cacheService.removeSessionInfo(sessionId);
            if (sessionInfo != null) {
                cacheService.removeChannelSession(sessionInfo.getChannelId(), sessionId);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove session: " + e.getMessage());
        }

        LOGGER.debug("Session removed from cache: {}", sessionId);
    }
}
