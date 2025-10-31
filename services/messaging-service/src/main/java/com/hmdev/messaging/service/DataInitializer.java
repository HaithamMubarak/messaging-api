package com.hmdev.messaging.service;

import com.hmdev.messaging.common.security.MySecurity;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.exception.ChannelLimitExceededException;
import com.hmdev.messaging.service.data.model.Developer;
import com.hmdev.messaging.service.repo.DeveloperRepository;
import com.hmdev.messaging.service.service.ApiKeyService;
import com.hmdev.messaging.service.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {
    private final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DeveloperRepository developerRepository;
    private final ApiKeyService apiKeyService;
    private final EventMessageService<Channel> messageService;

    // Configuration properties (can be set in application.properties or via environment variables)
    @Value("${messaging.init.admin.email:${ADMIN_EMAIL:admin@local.com}}")
    private String adminEmail;

    @Value("${messaging.init.admin.name:${ADMIN_NAME:Admin}}")
    private String adminName;

    @Value("${messaging.init.admin.keyId:${DEFAULT_API_KEY:c9b1c8f2-3a5b-4f2a-8d2b-1234567890ab}}")
    private String adminKeyId;

    @Value("${messaging.init.default.channelName:default}")
    private String defaultChannelName;

    @Value("${messaging.init.default.channelPassword:default}")
    private String defaultChannelPassword;

    public DataInitializer(DeveloperRepository developerRepository, ApiKeyService apiKeyService,
                           EventMessageService<Channel> messageService) {
        this.developerRepository = developerRepository;
        this.apiKeyService = apiKeyService;
        this.messageService = messageService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            // Seed a single developer (owner) for the system using configured values
            Optional<Developer> maybeAdmin = developerRepository.findByEmail(adminEmail);

            Developer admin;
            if (maybeAdmin.isPresent()) {
                admin = maybeAdmin.get();
                // Ensure admin is active and has developer role
                admin.setActive(true);
                if (admin.getRoles() == null || !admin.getRoles().contains("developer")) {
                    admin.setRoles((admin.getRoles() == null ? "" : admin.getRoles() + ",") + "developer,admin");
                }
                developerRepository.save(admin);
                log.info("Default developer {} already exists", adminEmail);
            } else {
                // If DB empty or admin missing, create admin developer
                Developer dev = new Developer();
                dev.setName(adminName);
                dev.setEmail(adminEmail);
                dev.setCompany("local");
                dev.setRoles("developer,admin");
                dev.setActive(true);
                admin = developerRepository.save(dev);
                log.warn("Created default developer {}", adminEmail);
            }

            // Deactivate any other developers so the system effectively has a single active developer
            developerRepository.findAll().stream()
                    .filter(d -> !d.getEmail().equals(adminEmail))
                    .forEach(d -> {
                        if (d.isActive()) {
                            d.setActive(false);
                            d.setRoles(null);
                            developerRepository.save(d);
                            log.info("Deactivated extra developer: {}", d.getEmail());
                        }
                    });

            // Parse adminKeyId property into UUID with safe fallback
            UUID adminKeyId = UUID.fromString(this.adminKeyId);

            ApiKeyService.CreatedKey createdKey = apiKeyService.createDeterministicKey(admin, adminKeyId, "default-key-for-admin");
            final String adminKeyIdStr = createdKey.getKeyId();

            // Create default channel using configured name/password and derive channel id deterministically
            // Derive channel id using the same algorithm used by controller: deriveChannelSecret(devApiKey + ":" + name, password)
            String channelSecret = MySecurity.deriveChannelSecret(defaultChannelName, defaultChannelPassword);
            String passwordHash = MySecurity.hash(defaultChannelPassword, channelSecret);
            String channelId = Utils.createChannelId(defaultChannelName, passwordHash, adminKeyIdStr);

            try {
                messageService.createChannel(channelId, adminKeyId.toString(), defaultChannelName, passwordHash);
                log.warn("Created/ensured default channel '{}' with channelId={}", defaultChannelName, channelId);
            } catch (ChannelLimitExceededException cle) {
                log.warn("Unable to create default channel for {}: {}", admin.getEmail(), cle.getMessage());
            } catch (Exception ex) {
                log.warn("Failed to create default channel: {}", ex.getMessage());
            }

        } catch (Exception e) {
            log.warn("Skipping DB seed - database unavailable or migration not run yet: {}", e.getMessage());
        }
    }

    public static void main(String[] args) {
        String defaultChannelName = "default";
        String defaultChannelPassword = "default";
        String adminKeyIdProperty = "c9b1c8f2-3a5b-4f2a-8d2b-1234567890ab";
        String channelSecret = MySecurity.deriveChannelSecret(defaultChannelName, defaultChannelPassword);
        String passwordHash = MySecurity.hash(defaultChannelPassword, channelSecret);
        String channelId = Utils.createChannelId(defaultChannelName, passwordHash, adminKeyIdProperty);
        System.out.println(passwordHash);
        System.out.println(channelSecret);

    }
}
