package com.hmdev.messaging.service.repo;

import com.hmdev.messaging.service.data.model.ApiKey;
import com.hmdev.messaging.service.data.model.Developer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyId(UUID keyId);
    List<ApiKey> findByDeveloper(Developer developer);
    List<ApiKey> findByDeveloperId(Long developerId);
}
