package com.hmdev.messaging.common.session;

import com.hmdev.messaging.common.data.AgentInfo;

import java.util.List;

/**
 * Generic interface for managing agent sessions and channels.
 * Implementations may use Kafka, in-memory, etc.
 */
public interface GenericSessionManager {

    /**
     * Stores a new agent session.
     * Associates both sessionId -> AgentInfo and channelId -> List<AgentInfo>.
     */
    void putSession(String sessionId, SessionInfo info);

    /**
     * Retrieves a single AgentInfo by session ID.
     * @param sessionId session identifier
     * @return AgentInfo or null if not found
     */
    SessionInfo getSession(String sessionId);

    /**
     * Retrieves all agents sessions associated with a specific channel ID.
     * @param channelId channel identifier
     * @return list of AgentInfo (possibly empty)
     */
    List<SessionInfo> getSessionsByChannel(String channelId);

    /**
     * Removes an agent session completely from both session and channel mappings.
     * Also triggers removal from persistence (Kafka, etc.)
     */
    void removeSession(String sessionId);
}
