package com.hmdev.messaging.service.controller;

import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.ChannelMetadata;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.service.data.JsonResponse;
import com.hmdev.messaging.service.data.model.ApiKey;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.data.model.Developer;
import com.hmdev.messaging.service.exception.InvalidAccessException;
import com.hmdev.messaging.service.exception.InvalidApiKeyException;
import com.hmdev.messaging.service.service.ApiKeyService;
import com.hmdev.messaging.service.service.ChannelService;
import com.hmdev.messaging.service.service.cache.CacheService;
import com.hmdev.messaging.service.service.provider.IChannelTopicProvider;
import com.hmdev.messaging.service.service.DeveloperService;
import com.hmdev.messaging.common.ApiConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.util.*;

@RestController
@RequestMapping(path = "/messaging-platform/api/v1/messaging-service/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminController.class);

    private final EventMessageService<Channel> messageService;
    private final ChannelService channelService;
    private final CacheService cacheService;
    private final IChannelTopicProvider channelTopicProvider;
    private final ApiKeyService apiKeyService;
    private final DeveloperService developerService;

    // No static admin secrets: authentication is performed using developer API keys only
    // (expect X-Api-Key header containing a developer key with 'admin' role)

    public AdminController(EventMessageService<Channel> messageService,
                           ChannelService channelService,
                           CacheService cacheService,
                           IChannelTopicProvider channelTopicProvider,
                           ApiKeyService apiKeyService, DeveloperService developerService) {
        this.messageService = messageService;
        this.channelService = channelService;
        this.cacheService = cacheService;
        this.channelTopicProvider = channelTopicProvider;
        this.apiKeyService = apiKeyService;
        this.developerService = developerService;
    }

    @PostConstruct
    public void init() {
    }

    /**
     * Secret admin endpoint: permanently delete a channel record, clear its cache, and delete the underlying topic (when supported).
     * Requires admin authentication (X-Api-Key) containing a developer key with admin role.
     */
    @PostMapping(path = "/secret/channel/{channelId}/delete-full")
    public JsonResponse secretDeleteChannelFull(@PathVariable("channelId") String channelId,
                                                @RequestHeader Map<String, String> headers) {

        checkDeveloper(headers, true);

        boolean cacheCleared = false;
        boolean dbDeleted = false;
        boolean topicDeleted = false;

        // 1) clear cache related to channel (best-effort)
        try {
            cacheService.removeChannel(channelId);
            cacheCleared = true;
        } catch (Exception e) {
            LOGGER.warn("Secret delete: failed to clear cache for {}: {}", channelId, e.getMessage());
        }

        // 2) if channel exists in DB, obtain topic name before deletion
        String topicName = null;
        Channel channel = channelService.findByChannelId(channelId).orElse(null);
        if (channel != null && channel.getMetadata() != null) {
            topicName = channel.getMetadata().getTopicName();
        }

        // 3) delete DB record
        try {
            Optional<Channel> deleted = channelService.deleteChannel(channelId);
            dbDeleted = deleted.isPresent();
        } catch (Exception e) {
            LOGGER.error("Secret delete: failed to delete channel {} from DB: {}", channelId, e.getMessage(), e);
        }

        // 4) attempt to delete underlying topic if we have a topic name and provider supports it
        if (topicName != null) {
            try {
                topicDeleted = channelTopicProvider.deleteTopic(topicName);
                if (!topicDeleted) {
                    LOGGER.warn("Secret delete: topic deletion returned false for {}", topicName);
                }
            } catch (Exception e) {
                LOGGER.error("Secret delete: failed to delete topic {}: {}", topicName, e.getMessage(), e);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("channelId", channelId);
        result.put("cacheCleared", cacheCleared);
        result.put("dbDeleted", dbDeleted);
        result.put("topicDeleted", topicDeleted);
        result.put("topicName", topicName);

        return JsonResponse.success(result);

    }

    @GetMapping(path = "/channels")
    public JsonResponse listChannels(@RequestHeader Map<String, String> headers) {
        Developer developer = checkDeveloper(headers, false);
        List<Channel> real = channelService.findChannelsByDeveloperId(developer.getId());
        List<ChannelDto> list = new ArrayList<>();
        if (real != null) {
            for (Channel ch : real) {
                list.add(mapChannelToDto(ch));
            }
        }
        return JsonResponse.success(list);
    }

    @GetMapping(path = "/channel/{channelId}")
    public JsonResponse channelById(@PathVariable("channelId") String channelId,
                                    @RequestHeader Map<String, String> headers) {
        Developer developer = checkDeveloper(headers, false);
        Channel channel = channelService.findByChannelId(channelId).orElse(null);
        if (channel == null) return JsonResponse.error("Channel not found: " + channelId);
        if (!developer.isAdmin() && !(channel.getOwner() != null &&
                Objects.equals(developer.getId(), channel.getOwner().getId())))
        {
            throw new InvalidAccessException("Access denied to channel: " + channelId);
        }

        return JsonResponse.success(mapChannelToDto(channel));
    }

    // --- Admin ACL management for channels ---
    @GetMapping(path = "/channel/{channelId}/acl")
    public JsonResponse getChannelAcl(@PathVariable("channelId") String channelId,
                                      @RequestHeader Map<String, String> headers) {
        checkDeveloper(headers, false);
        Optional<Channel> chOpt = findChannelEntity(channelId);
        if (chOpt.isEmpty()) return JsonResponse.error("Channel not found: " + channelId);
        Channel ch = chOpt.get();
        ChannelMetadata meta = metadataOf(ch);
        Map<String, Object> resp = new HashMap<>();
        resp.put("publicChannel", meta.isPublicChannel());
        resp.put("allowedAgentsNames", meta.getAllowedAgentsNames());
        return JsonResponse.success(resp);

    }

    @PutMapping(path = "/channel/{channelId}/acl", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse updateChannelAcl(@PathVariable("channelId") String channelId,
                                         @RequestBody ACLRequest req,
                                         @RequestHeader Map<String, String> headers) {
        checkDeveloper(headers, false);
        Optional<Channel> chOpt = findChannelEntity(channelId);
        if (chOpt.isEmpty()) return JsonResponse.error("Channel not found: " + channelId);
        Channel ch = chOpt.get();
        ChannelMetadata meta = metadataOf(ch);

        if (req.publicChannel != null) meta.setPublicChannel(req.publicChannel);
        if (req.allowedAgentsNames != null) meta.setAllowedAgentsNames(req.allowedAgentsNames);

        return saveChannelMetadata(ch, meta);
    }

    // Add a single reserved agent name (convenience)
    @PostMapping(path = "/channel/{channelId}/acl/reserved", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse addReservedAgent(@PathVariable("channelId") String channelId,
                                         @RequestBody Map<String, String> body,
                                         @RequestHeader Map<String, String> headers) {
        checkDeveloper(headers, false);
        String name = body == null ? null : body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return JsonResponse.error("Missing name to reserve");
        }

        Optional<Channel> chOpt = findChannelEntity(channelId);
        if (chOpt.isEmpty()) return JsonResponse.error("Channel not found: " + channelId);
        Channel ch = chOpt.get();
        boolean added = addReservedAgentName(ch, name);
        if (!added) return JsonResponse.error("Already reserved: " + name);
        return JsonResponse.success("Reserved name added: " + name);

    }

    // Remove a single reserved agent name (convenience)
    @DeleteMapping(path = "/channel/{channelId}/acl/reserved/{name}")
    public JsonResponse removeReservedAgent(@PathVariable("channelId") String channelId,
                                            @PathVariable("name") String name,
                                            @RequestHeader Map<String, String> headers) {
        checkDeveloper(headers, false);

        Optional<Channel> chOpt = findChannelEntity(channelId);
        if (chOpt.isEmpty()) return JsonResponse.error("Channel not found: " + channelId);
        Channel ch = chOpt.get();
        boolean removed = removeReservedAgentName(ch, name);
        if (!removed) return JsonResponse.error("Not reserved: " + name);
        return JsonResponse.success("Reserved name removed: " + name);
    }

    // --- Developer API key management ---
    @GetMapping(path = "/api-keys")
    public JsonResponse listApiKeys(@RequestHeader Map<String, String> headers) {
        Developer developer = checkDeveloper(headers, true);
        List<ApiKey> keys = apiKeyService.getApiKeysByDeveloper(developer.getId());
        return JsonResponse.success(keys);
    }

    @PostMapping(path = "/api-key", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse createApiKey(@RequestBody Developer dev,
                                     @RequestHeader Map<String, String> headers) {
        checkDeveloper(headers, true);
        String email = dev == null ? null : dev.getEmail();
        if (email == null || email.trim().isEmpty()) return JsonResponse.error("Missing developer email");
        ApiKeyService.CreatedKey created = developerService.createKeyForDeveloper(email.trim(), dev.getName());
        Map<String, Object> resp = new HashMap<>();
        resp.put("email", email.trim());
        resp.put("keyId", created.getKeyId());
        resp.put("secret", created.getSecret());
        return JsonResponse.success(resp);
    }

    @DeleteMapping(path = "/api-key/{developerId}")
    public JsonResponse deleteApiKey(@PathVariable("developerId") String developerId,
                                     @RequestHeader Map<String, String> headers) {
        Developer developer = checkDeveloper(headers, true);
        return JsonResponse.error("Deleting developers/keys is not supported via this endpoint");
    }

    @GetMapping(path = "/health")
    public JsonResponse healthCheck() {
        return JsonResponse.success("OK");
    }

    @GetMapping(path = "/audit")
    public JsonResponse audit(@RequestParam(name = "limit", required = false) Integer limit,
                              @RequestHeader Map<String, String> headers) {
        // Require admin role to view audit entries
        checkDeveloper(headers, true);
        // Audit functionality is deprecated/disabled; return empty list by default
        return JsonResponse.success(Collections.emptyList());
    }

    @ExceptionHandler(Exception.class)
    public JsonResponse handleControllerError(Exception exception) {
        LOGGER.error("AdminController error:", exception);
        if (exception instanceof InvalidApiKeyException) {
            return JsonResponse.unauthorized(exception.getMessage());
        } else {
            return JsonResponse.error(exception.getMessage());
        }
    }

    private Developer checkDeveloper(Map<String, String> headers, boolean requireAdmin) {
        Developer dev = null;
        if (headers == null) headers = Collections.emptyMap();
        String presentedApiKey = headers.getOrDefault(ApiConstants.HEADER_API_KEY, headers.getOrDefault(ApiConstants.HEADER_API_KEY.toLowerCase(), null));
        if (CommonUtils.isNotEmpty(presentedApiKey)) {
            presentedApiKey = presentedApiKey.trim();
            Optional<Developer> maybeDev = apiKeyService.findDeveloperByKeyId(presentedApiKey);
            if (maybeDev.isPresent()) {
                dev = maybeDev.get();
                if (!requireAdmin) return dev;
                if (dev.getRoles() != null && dev.getRoles().toLowerCase().contains(ApiConstants.ROLE_ADMIN)) return dev;
            }
        }
        if (dev == null) {
            throw new InvalidApiKeyException(presentedApiKey);
        }
        return dev;
    }


    // Helper: map Channel entity to DTO and enrich with offsets if available
    private ChannelDto mapChannelToDto(Channel ch) {
        ChannelDto dto = new ChannelDto();
        dto.channelId = ch.getChannelId();
        dto.eventCount = ch.getEventCount() == null ? 0 : ch.getEventCount().intValue();
        // No in-memory agent list available in production; populate empty list
        dto.connectedAgents = new ArrayList<>();
        try {
            com.hmdev.messaging.common.data.ChannelOffsetInfo info = messageService.peekChannelOffsets(dto.channelId);
            if (info != null) {
                dto.cacheCounter = info.getCacheLocalCounter();
                dto.dbLocalOffset = info.getDbLocalOffset();
                dto.dbGlobalOffset = info.getDbGlobalOffset();
                dto.kafkaLast = info.getKafkaLastOffset();
            }
        } catch (Exception ignore) {
        }
        return dto;
    }

    // Helper utilities to remove duplication
    private Optional<Channel> findChannelEntity(String channelId) {
        try {
            return channelService.findByChannelId(channelId);
        } catch (Exception e) {
            LOGGER.warn("findChannelEntity failed for {}: {}", channelId, e.getMessage());
            return Optional.empty();
        }
    }

    private ChannelMetadata metadataOf(Channel ch) {
        ChannelMetadata meta = ch.getMetadata();
        if (meta == null) meta = new ChannelMetadata();
        return meta;
    }

    private JsonResponse saveChannelMetadata(Channel ch, ChannelMetadata meta) {
        ch.setMetadata(meta);
        Channel updated = channelService.updateChannel(ch);
        Map<String, Object> resp = new HashMap<>();
        resp.put("channelId", updated.getChannelId());
        resp.put("metadata", updated.getMetadata());
        return JsonResponse.success(resp);
    }

    private boolean addReservedAgentName(Channel ch, String name) {
        com.hmdev.messaging.common.data.ChannelMetadata meta = metadataOf(ch);
        List<String> reserved = meta.getAllowedAgentsNames();
        if (reserved == null) {
            reserved = new ArrayList<>();
            meta.setAllowedAgentsNames(reserved);
        }
        if (reserved.contains(name)) return false;
        reserved.add(name);
        ch.setMetadata(meta);
        channelService.updateChannel(ch);
        return true;
    }

    private boolean removeReservedAgentName(Channel ch, String name) {
        com.hmdev.messaging.common.data.ChannelMetadata meta = metadataOf(ch);
        List<String> reserved = meta.getAllowedAgentsNames();
        if (reserved == null) return false;
        boolean removed = reserved.removeIf(s -> s != null && s.equals(name));
        if (removed) {
            ch.setMetadata(meta);
            channelService.updateChannel(ch);
        }
        return removed;
    }

    public static class ACLRequest {
        public Boolean publicChannel;
        public List<String> allowedAgentsNames;
    }

    // Minimal DTOs for admin UI serialization
    static class ChannelDto {
        public String channelId;
        public int eventCount;
        public List<AgentDto> connectedAgents;
        // optional offsets provided by messageService.peekChannelOffsets
        public Long cacheCounter;
        public Long dbLocalOffset;
        public Long dbGlobalOffset;
        public Long kafkaLast;

        public ChannelDto() {
        }

        public ChannelDto(String channelId, int eventCount, List<AgentDto> connectedAgents) {
            this.channelId = channelId;
            this.eventCount = eventCount;
            this.connectedAgents = connectedAgents;
        }
    }

    static class AgentDto {
        public String agentName;
        public String sessionId;
        public Long lastSeenTime;
        public Long lastReadTime;

        public AgentDto(String agentName, String sessionId, Long lastSeenTime, Long lastReadTime) {
            this.agentName = agentName;
            this.sessionId = sessionId;
            this.lastSeenTime = lastSeenTime;
            this.lastReadTime = lastReadTime;
        }
    }
}
