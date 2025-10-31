package com.hmdev.messaging.service.utils.lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Keeps track of acquired locks for the current request thread and
 * ensures they are released when the request finishes.
 * Demo mode uses in-memory locks instead of Redis-based distributed locks.
 */
@Component
public class LockRegisterService {
    private static final Logger LOGGER = LoggerFactory.getLogger(LockRegisterService.class);

    private static final ThreadLocal<Map<String, String>> LOCKS = ThreadLocal.withInitial(HashMap::new);

    private final InMemoryDistributedLock distributedLock;

    // Lock configuration moved here so callers don't need to manage TTL/wait/retry
    @Value("${messaging.receive.lock.ttl-ms:30000}")
    private long lockTtlMs;

    @Value("${messaging.receive.lock.wait-ms:0}")
    private long lockWaitMs;

    @Value("${messaging.receive.lock.retry-ms:200}")
    private long lockRetryMs;

    @Autowired
    public LockRegisterService(InMemoryDistributedLock distributedLock) {
        this.distributedLock = distributedLock;
    }

    /**
     * Try to acquire and register a lock for the current request/thread.
     * Returns the lock token when acquired, otherwise null.
     */
    public String registerLock(String key) {
        if (key == null) return null;
        try {
            String token = distributedLock.tryLock(key, lockTtlMs, lockWaitMs, lockRetryMs);
            if (token != null) {
                LOCKS.get().put(key, token);
            }
            return token;
        } catch (Exception e) {
            LOGGER.warn("Failed to acquire/register lock for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * Register a lock token for the current request/thread so it can be
     * released later by the cleanup filter. (Retained for explicit registration.)
     */
    public void registerLock(String key, String token) {
        if (key == null || token == null) return;
        try {
            LOCKS.get().put(key, token);
        } catch (Exception e) {
            LOGGER.warn("Failed to register lock for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * Unlock and clear all locks registered for the current thread. Safe to call multiple times.
     */
    public void clearAndUnlockAll() {
        Map<String, String> map = LOCKS.get();
        if (map == null || map.isEmpty()) {
            LOCKS.remove();
            return;
        }

        // copy keys to avoid concurrent modification
        List<Map.Entry<String, String>> entries = new ArrayList<>(map.entrySet());
        for (Map.Entry<String, String> e : entries) {
            try {
                boolean unlocked = distributedLock.unlock(e.getKey(), e.getValue());
                if (!unlocked) {
                    LOGGER.warn("Failed to unlock key {} (token {})", e.getKey(), e.getValue());
                }
            } catch (Exception ex) {
                LOGGER.warn("Exception while unlocking key {}: {}", e.getKey(), ex.getMessage());
            }
        }

        map.clear();
        LOCKS.remove();
    }
}
