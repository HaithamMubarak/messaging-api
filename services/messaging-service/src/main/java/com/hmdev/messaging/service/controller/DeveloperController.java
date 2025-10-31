package com.hmdev.messaging.service.controller;

import com.hmdev.messaging.service.service.DeveloperService;
import com.hmdev.messaging.service.service.ApiKeyService;
import com.hmdev.messaging.service.repo.ApiKeyRepository;
import com.hmdev.messaging.service.repo.DeveloperRepository;
import com.hmdev.messaging.service.data.model.ApiKey;
import com.hmdev.messaging.service.data.model.Developer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hmdev.messaging.common.ApiConstants;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/internal/devs")
public class DeveloperController {

    private final DeveloperService developerService;
    private final ApiKeyRepository apiKeyRepository;
    private final DeveloperRepository developerRepository;

    @Value("${messaging.admin.api-key:}")
    private String adminApiKey;

    public DeveloperController(DeveloperService developerService, ApiKeyRepository apiKeyRepository, DeveloperRepository developerRepository) {
        this.developerService = developerService;
        this.apiKeyRepository = apiKeyRepository;
        this.developerRepository = developerRepository;
    }

    // Ensure developer exists; returns developer email and name
    @PostMapping("/ensure")
    public ResponseEntity<?> ensureDeveloper(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email is required"));
        }
        var dev = developerService.ensureDeveloper(email.trim(), name);
        return ResponseEntity.ok(Map.of("email", dev.getEmail(), "name", dev.getName()));
    }

    // Create API key for developer (creates dev if missing) and return the presented key to caller
    @PostMapping("/{email}/keys")
    public ResponseEntity<?> createApiKey(@PathVariable("email") String email, @RequestBody Map<String, String> body) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email path param is required"));
        }
        String description = body.getOrDefault("description", "API key created via internal endpoint");

        ApiKeyService.CreatedKey created = developerService.createKeyForDeveloper(email.trim(), description);
        return ResponseEntity.ok(Map.of("keyId", created.getKeyId(), "secret", created.getSecret()));
    }

    // Admin: list non-secret API key ids (UUIDs) for a developer email
    @GetMapping("/{email}/keys")
    public ResponseEntity<?> listApiKeys(@PathVariable("email") String email,
                                         @RequestHeader Map<String, String> headers) {
        // Reuse admin API key check (accepts X-Admin-Key or Basic auth depending on configuration). For compatibility,
        // fall back to original behavior when admin key is not configured.
        if (adminApiKey == null || adminApiKey.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin API is not enabled"));
        }
        // Check headers for X-Admin-Key or X-Admin-Token or Authorization basic depending on env. Simplest behavior: compare X-Admin-Key.
        String presented = headers.getOrDefault(ApiConstants.HEADER_API_KEY, headers.getOrDefault(ApiConstants.HEADER_API_KEY.toLowerCase(), headers.getOrDefault("X-Admin-Token", headers.getOrDefault("x-admin-token", null))));
        if (presented == null || !presented.equals(adminApiKey)) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid admin key"));
        }
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing email parameter"));
        }
        Optional<Developer> maybe = developerRepository.findByEmail(email);
        if (maybe.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Developer not found"));
        }
        Developer dev = maybe.get();
        List<ApiKey> keys = apiKeyRepository.findByDeveloper(dev);
        List<String> ids = keys.stream().map(k -> k.getKeyId().toString()).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("keyIds", ids));
    }
}
