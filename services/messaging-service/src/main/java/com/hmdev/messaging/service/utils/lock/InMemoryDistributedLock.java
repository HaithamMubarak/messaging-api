package com.hmdev.messaging.service.utils.lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Simple in-memory distributed lock implementation for demo mode.
 * Note: This is NOT truly distributed - it only works within a single JVM.
 * For production use across multiple instances, use Redis-based locks.
 */
@Component
public class InMemoryDistributedLock {

    private static final Logger LOGGER = LoggerFactory.getLogger(InMemoryDistributedLock.class);

    private final Map<String, LockEntry> locks = new ConcurrentHashMap<>();

    private static class LockEntry {
        final Lock lock = new ReentrantLock();
        String token;
        long expiryTime;
    }

    /**
     * Try to acquire a lock with the given key.
     * 
     * @param key lock key
     * @param ttlMs time-to-live in milliseconds
     * @param waitMs maximum wait time in milliseconds
     * @param retryMs retry interval in milliseconds
     * @return lock token if acquired, null otherwise
     */
    public String tryLock(String key, long ttlMs, long waitMs, long retryMs) {
        if (key == null) {
            return null;
        }

        LockEntry entry = locks.computeIfAbsent(key, k -> new LockEntry());
        
        try {
            long startTime = System.currentTimeMillis();
            long deadline = startTime + waitMs;
            
            do {
                // Try to acquire the lock
                boolean acquired = entry.lock.tryLock(retryMs, TimeUnit.MILLISECONDS);
                
                if (acquired) {
                    try {
                        // Check if lock is expired
                        if (entry.token != null && System.currentTimeMillis() < entry.expiryTime) {
                            // Lock is still held by someone else
                            entry.lock.unlock();
                            if (System.currentTimeMillis() >= deadline) {
                                return null;
                            }
                            continue;
                        }
                        
                        // Acquire the lock
                        String token = UUID.randomUUID().toString();
                        entry.token = token;
                        entry.expiryTime = System.currentTimeMillis() + ttlMs;
                        LOGGER.debug("Lock acquired: key={}, token={}", key, token);
                        return token;
                    } finally {
                        entry.lock.unlock();
                    }
                }
                
                if (System.currentTimeMillis() >= deadline) {
                    return null;
                }
            } while (true);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            LOGGER.warn("Interrupted while trying to acquire lock: {}", key);
            return null;
        } catch (Exception e) {
            LOGGER.error("Error acquiring lock: {}", key, e);
            return null;
        }
    }

    /**
     * Unlock a previously acquired lock.
     * 
     * @param key lock key
     * @param token lock token
     * @return true if unlocked, false otherwise
     */
    public boolean unlock(String key, String token) {
        if (key == null || token == null) {
            return false;
        }

        LockEntry entry = locks.get(key);
        if (entry == null) {
            LOGGER.warn("Unlock failed: no lock entry for key={}", key);
            return false;
        }

        entry.lock.lock();
        try {
            if (!token.equals(entry.token)) {
                LOGGER.warn("Unlock failed: token mismatch for key={}", key);
                return false;
            }
            
            // Check if lock is expired
            if (System.currentTimeMillis() >= entry.expiryTime) {
                LOGGER.warn("Unlock: lock already expired for key={}", key);
            }
            
            // Clear the lock
            entry.token = null;
            entry.expiryTime = 0;
            LOGGER.debug("Lock released: key={}, token={}", key, token);
            return true;
        } finally {
            entry.lock.unlock();
        }
    }
}
