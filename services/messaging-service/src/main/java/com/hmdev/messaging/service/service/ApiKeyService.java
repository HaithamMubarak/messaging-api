package com.hmdev.messaging.service.service;

import com.hmdev.messaging.service.data.model.ApiKey;
import com.hmdev.messaging.service.data.model.Developer;
import com.hmdev.messaging.service.repo.ApiKeyRepository;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

@Service
public class ApiKeyService {
    private final ApiKeyRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    private final SecureRandom secure = new SecureRandom();
    private final Logger log = LoggerFactory.getLogger(ApiKeyService.class);

    public ApiKeyService(ApiKeyRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public CreatedKey createKey(Developer dev, String description) {
        UUID keyId = UUID.randomUUID();
        byte[] secretBytes = new byte[32];
        secure.nextBytes(secretBytes);
        String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        String combined = keyId + "." + secret;
        String hash = encoder.encode(combined);

        ApiKey ak = new ApiKey();
        ak.setKeyId(keyId);
        ak.setKeyHash(hash);
        ak.setDescription(description);
        ak.setDeveloper(dev);
        ak.setCreatedAt(Instant.now());
        repo.save(ak);

        log.info("Created API key for developer {} keyId={}", dev.getEmail(), keyId);
        return new CreatedKey(keyId.toString(), secret);
    }

    /**
     * Create an API key with a fixed UUID and a deterministic secret derived from the UUID.
     * If a key with the provided keyId already exists, the existing key is left unchanged and
     * a CreatedKey with the deterministic secret is returned (but the secret will only be valid
     * if the key record was originally created with the same deterministic secret).
     */
    @Transactional
    public CreatedKey createDeterministicKey(Developer dev, UUID keyId, String description) {
        // If key exists, just return the deterministic secret so callers can know the secret (useful in dev)
        Optional<ApiKey> existing = repo.findByKeyId(keyId);
        String secret = deriveSecretFromKeyId(keyId);
        if (existing.isPresent()) {
            log.info("ApiKey with keyId {} already exists, skipping creation", keyId);
            return new CreatedKey(keyId.toString(), secret);
        }

        String combined = keyId + "." + secret;
        String hash = encoder.encode(combined);

        ApiKey ak = new ApiKey();
        ak.setKeyId(keyId);
        ak.setKeyHash(hash);
        ak.setDescription(description);
        ak.setDeveloper(dev);
        ak.setCreatedAt(Instant.now());
        repo.save(ak);

        log.info("Created deterministic API key for developer {} keyId={}", dev.getEmail(), keyId);
        return new CreatedKey(keyId.toString(), secret);
    }

    public List<ApiKey> getApiKeysByDeveloper(Long developerId) {
        return repo.findByDeveloperId(developerId);
    }

    // New: resolve a presented key (<keyId>.<secret>) to the owning Developer if valid and not revoked
    public Optional<Developer> findDeveloperByPresentedKey(String presented) {
        if (presented == null || !presented.contains(".")) return Optional.empty();
        String[] parts = presented.split("\\.", 2);
        String keyIdStr = parts[0];
        String secret = parts[1];
        UUID keyId;
        try {
            keyId = UUID.fromString(keyIdStr);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
        Optional<ApiKey> maybe = repo.findByKeyId(keyId);
        if (maybe.isEmpty()) return Optional.empty();
        ApiKey ak = maybe.get();
        if (ak.isRevoked()) return Optional.empty();
        String combined = keyIdStr + "." + secret;
        if (!encoder.matches(combined, ak.getKeyHash())) return Optional.empty();
        return Optional.ofNullable(ak.getDeveloper());
    }

    // New: resolve a developer by keyId only (no secret required). Useful for simplified clients that only send key_id.
    public Optional<Developer> findDeveloperByKeyId(String keyIdStr) {
        if (keyIdStr == null) return Optional.empty();
        UUID keyId;
        try {
            keyId = UUID.fromString(keyIdStr);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
        Optional<ApiKey> maybe = repo.findByKeyId(keyId);
        if (maybe.isEmpty()) return Optional.empty();
        ApiKey ak = maybe.get();
        if (ak.isRevoked()) return Optional.empty();
        return Optional.ofNullable(ak.getDeveloper());
    }


    private String deriveSecretFromKeyId(UUID keyId) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(keyId.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            // fallback: use Base64 of UUID bytes
            return Base64.getUrlEncoder().withoutPadding().encodeToString(keyId.toString().getBytes(StandardCharsets.UTF_8));
        }
    }

    public boolean verify(String presented) {
        if (presented == null || !presented.contains(".")) return false;
        String[] parts = presented.split("\\.", 2);
        String keyIdStr = parts[0];
        String secret = parts[1];
        UUID keyId;
        try {
            keyId = UUID.fromString(keyIdStr);
        } catch (IllegalArgumentException e) {
            return false;
        }
        Optional<ApiKey> maybe = repo.findByKeyId(keyId);
        if (maybe.isEmpty()) return false;
        ApiKey ak = maybe.get();
        if (ak.isRevoked()) return false;
        String combined = keyIdStr + "." + secret;
        return encoder.matches(combined, ak.getKeyHash());
    }

    @Getter
    public static class CreatedKey {
        private final String keyId;
        private final String secret;

        public CreatedKey(String keyId, String secret) {
            this.keyId = keyId;
            this.secret = secret;
        }
    }
}
