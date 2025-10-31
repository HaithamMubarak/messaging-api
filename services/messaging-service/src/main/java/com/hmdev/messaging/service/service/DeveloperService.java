package com.hmdev.messaging.service.service;

import com.hmdev.messaging.service.data.model.Developer;
import com.hmdev.messaging.service.repo.DeveloperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DeveloperService {

    private final DeveloperRepository developerRepository;
    private final ApiKeyService apiKeyService;

    public DeveloperService(DeveloperRepository developerRepository, ApiKeyService apiKeyService) {
        this.developerRepository = developerRepository;
        this.apiKeyService = apiKeyService;
    }

    @Transactional
    public Developer ensureDeveloper(String email, String name) {
        Optional<Developer> existing = developerRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        Developer dev = new Developer();
        dev.setEmail(email);
        dev.setName(name != null ? name : email);
        dev.setCompany(null);
        dev.setRoles("developer");
        dev.setActive(true);
        developerRepository.save(dev);
        return dev;
    }

    @Transactional
    public ApiKeyService.CreatedKey createKeyForDeveloper(String email, String description) {
        Developer dev = ensureDeveloper(email, null);
        return apiKeyService.createKey(dev, description);
    }
}

