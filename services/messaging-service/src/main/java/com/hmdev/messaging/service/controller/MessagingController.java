package com.hmdev.messaging.service.controller;

import com.hmdev.messaging.common.ApiConstants;
import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.*;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.common.session.SessionInfo;
import com.hmdev.messaging.common.session.GenericSessionManager;
import com.hmdev.messaging.common.data.CreateChannelRequest;
import com.hmdev.messaging.service.data.JsonResponse;
import com.hmdev.messaging.service.data.model.Developer;
import com.hmdev.messaging.service.service.ApiKeyService;
import com.hmdev.messaging.service.service.ChannelService;
import com.hmdev.messaging.service.utils.Utils;
import com.hmdev.messaging.service.utils.lock.LockRegisterService;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.security.AgentAccessChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/messaging-platform/api/v1/messaging-service", produces = MediaType.APPLICATION_JSON_VALUE)
public class MessagingController {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessagingController.class);

    private final EventMessageService<Channel> messageService;
    private final GenericSessionManager sessionManager;
    private final LockRegisterService lockRegisterService;
    private final ChannelService channelService;
    private final ApiKeyService apiKeyService;

    @Autowired
    public MessagingController(EventMessageService<Channel> messageService,
                               GenericSessionManager sessionManager,
                               LockRegisterService lockRegisterService,
                               ChannelService channelService,
                               ApiKeyService apiKeyService) {
        this.messageService = messageService;
        this.sessionManager = sessionManager;
        this.lockRegisterService = lockRegisterService;
        this.channelService = channelService;
        this.apiKeyService = apiKeyService;
    }

    @PostMapping(path = "/connect", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object connect(@RequestBody(required = false) ConnectRequest connectRequest,
                          @RequestHeader(value = ApiConstants.HEADER_API_KEY, required = false) String devApiKey) {
        long timestamp = System.currentTimeMillis();

        if (connectRequest == null) {
            throw new IllegalArgumentException("Missing connect request");
        }

        // Demo mode: Use default API key if none provided
        if (CommonUtils.isEmpty(devApiKey)) {
            devApiKey = "demo-default-key";
        }

        // Prefer explicit channelId supplied by game server/client. If not present, derive from name+password.
        String channelId;
        if (CommonUtils.isNotEmpty(connectRequest.getChannelId())) {
            channelId = connectRequest.getChannelId();
        } else {
            if (CommonUtils.isEmpty(connectRequest.getChannelName()) ||
                    CommonUtils.isEmpty(connectRequest.getChannelPassword())) {
                throw new IllegalArgumentException("Missing channelId or channelName+channelPassword in connect request");
            }
            channelId = Utils.createChannelId(connectRequest.getChannelName(),
                    connectRequest.getChannelPassword(), devApiKey);
        }

        String agentName = connectRequest.getAgentName();
        if (CommonUtils.isEmpty(agentName)) {
            throw new IllegalArgumentException("Missing agentName in connect request");
        }

        // Acquire a distributed lock per channel to ensure only one connect operation runs concurrently for a given channelId
        String lockKey = "connect-lock:" + channelId;
        String lockToken = lockRegisterService.registerLock(lockKey);
        if (lockToken == null) {
            return JsonResponse.error("Connect already in progress for channel: " + channelId);
        }

        Channel channel = messageService.createChannel(channelId, devApiKey, connectRequest.getChannelName(),
                connectRequest.getChannelPassword());

        if (AgentAccessChecker.isAgentAllowed(channel.getMetadata().getAllowedAgentsNames(),
                agentName)) {
            return JsonResponse.error("Agent name unavailable: " + agentName);
        }

        boolean agentExists = sessionManager.getSessionsByChannel(channelId).stream()
                .map(SessionInfo::getAgentInfo)
                .map(AgentInfo::getAgentName)
                .anyMatch(agentName::equals);

        String sessionId = null;

        if (agentExists) {
            SessionInfo sessionInfo;
            // Checks agent re-connect operation if the agent wasn't disconnected properly before
            // 1 - A valid session ID should be sent
            // 2 - The same agent name as the previous session should be used
            if (CommonUtils.isNotEmpty(connectRequest.getSessionId())
                    && (sessionInfo = sessionManager.getSession(connectRequest.getSessionId())) != null
                    && Objects.equals(sessionInfo.getAgentInfo().getAgentName(), agentName)) {
                sessionId = connectRequest.getSessionId();
            } else {
                throw new IllegalStateException("This agent name is currently unavailable as it is already being used by another session.");
            }
        }

        // Creates new session id.
        if (sessionId == null) {
            sessionId = java.util.UUID.randomUUID().toString();
        }

        AgentInfo agentInfo = new AgentInfo(agentName, connectRequest.getAgentContext());

        // SessionInfo constructor parameters: (channelId, sessionId, agentInfo, globalOffset, localOffset, lastSeenTime, lastReadTime)
        SessionInfo createdSessionInfo = new SessionInfo(channelId, sessionId, agentInfo, 0L, 0L, timestamp, 0L);
        // send CONNECT event
        ChannelMetadata channelMetadata = messageService.send(channelId, new EventMessage(agentName, "*", EventMessage.EventType.CONNECT,
                false, null, timestamp));

        // Use values from the original connect request (may be null when connecting with channelId)
        channelMetadata.setChannelName(connectRequest.getChannelName());
        // For security, do NOT echo channelPassword back to clients. The server does not persist raw passwords.
        channelMetadata.setChannelPassword(null);

        // store session via session manager (SessionManager handles caching internally)
        sessionManager.putSession(sessionId, createdSessionInfo);

        ConnectResponse connectResponse = new ConnectResponse();
        connectResponse.setSessionId(sessionId);
        connectResponse.setChannelId(channelId);
        connectResponse.setDate(timestamp);
        connectResponse.setMetadata(channelMetadata);

        return JsonResponse.success(connectResponse);
    }

    @PostMapping(path = "/event", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object sendEvent(@RequestBody(required = false) EventMessageRequest eventMessageRequest) {

        long timestamp = System.currentTimeMillis();

        SessionInfo sessionInfo = fetchSessionInfo(eventMessageRequest.getSessionId());
        sessionInfo.setLastSeenTime(timestamp);

        // Update session timestamp
        sessionManager.putSession(eventMessageRequest.getSessionId(), sessionInfo);

        EventMessage eventMessage = new EventMessage(eventMessageRequest);
        eventMessage.setFrom(sessionInfo.getAgentInfo().getAgentName());
        eventMessage.setDate(timestamp);

        ChannelMetadata channelMetadata = messageService.send(sessionInfo.getChannelId(), eventMessage);

        return JsonResponse.success(channelMetadata);
    }

    @PostMapping(path = "/list-agents")
    public JsonResponse listAgents(@RequestBody(required = false) SessionRequest sessionRequest) {

        long timestamp = System.currentTimeMillis();

        // Update session timestamp
        SessionInfo sessionInfo = fetchSessionInfo(sessionRequest.getSessionId());
        sessionInfo.setLastSeenTime(timestamp);
        sessionManager.putSession(sessionRequest.getSessionId(), sessionInfo);

        List<AgentInfo> activeAgents = sessionManager.getSessionsByChannel(sessionInfo.getChannelId())
                .stream()
                .map(SessionInfo::getAgentInfo)
                .collect(Collectors.toList());
        return JsonResponse.success(activeAgents);
    }

    @PostMapping(path = "/receive", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse receive(@RequestBody(required = false) MessageReceiveRequest messageReceiveRequest) {

        long timestamp = System.currentTimeMillis();

        // Validate request
        if (messageReceiveRequest == null || messageReceiveRequest.getSessionId() == null) {
            return JsonResponse.error("Missing sessionId in receive request");
        }

        String sessionId = messageReceiveRequest.getSessionId();
        String lockKey = "receive-lock:" + sessionId;
        String lockToken = lockRegisterService.registerLock(lockKey);
        if (lockToken == null) {
            return JsonResponse.error("Receive already in progress for session: " + sessionId);
        }
        // register lock for automatic cleanup at end of request
        // lockRegisterService.registerLock(lockKey, lockToken); // already registered inside registerLock

        SessionInfo sessionInfo = fetchSessionInfo(sessionId);

        EventMessageResult eventMessageResult =
                messageService.receive(sessionInfo.getChannelId(), sessionInfo.getAgentInfo().getAgentName(),
                        messageReceiveRequest.getOffsetRange());

        // Update session timestamp, next offset and last read time
        sessionInfo.setGlobalOffset(eventMessageResult.getNextGlobalOffset());
        sessionInfo.setLocalOffset(eventMessageResult.getNextLocalOffset());
        sessionInfo.setLastSeenTime(timestamp);
        if (!eventMessageResult.getEvents().isEmpty())
        {
            sessionInfo.setLastReadTime( eventMessageResult.getEvents().get(eventMessageResult.getEvents().size() - 1).getDate());
        }

        // Update session timestamp
        sessionManager.putSession(sessionId, sessionInfo);

        return JsonResponse.success(eventMessageResult);
    }

    @PostMapping(path = "/disconnect", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object disconnect(@RequestBody(required = false) SessionRequest sessionRequest) {
        long timestamp = System.currentTimeMillis();
        SessionInfo sessionInfo = fetchSessionInfo(sessionRequest.getSessionId());
        AgentInfo agentInfo = sessionInfo.getAgentInfo();
        messageService.send(sessionInfo.getChannelId(), new EventMessage(agentInfo.getAgentName(), "*",
                EventMessage.EventType.DISCONNECT, false, null, timestamp));
        sessionManager.removeSession(sessionRequest.getSessionId());

        return JsonResponse.success();
    }

    @PostMapping(path = "/create-channel", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse createChannel(@RequestBody CreateChannelRequest req,
                                      @RequestHeader(value = ApiConstants.HEADER_API_KEY, required = false) String devApiKey) {
        if (req == null || req.getChannelName() == null || req.getChannelPassword() == null) {
            return JsonResponse.error("Missing channel name or password");
        }

        // Demo mode: Use default API key if none provided
        if (CommonUtils.isEmpty(devApiKey)) {
            devApiKey = "demo-default-key";
        }

        String channelId = Utils.createChannelId(req.getChannelName(), req.getChannelPassword(), devApiKey);
        Channel channel = messageService.createChannel(channelId, devApiKey,
                req.getChannelName(), req.getChannelPassword());
        return JsonResponse.success(channel);
    }

    @GetMapping(path = "/channels")
    public JsonResponse getChannelsByApiKey(@RequestHeader(value = ApiConstants.HEADER_API_KEY, required = false) String presentedKey) {
        if (presentedKey == null || presentedKey.isEmpty()) {
            return JsonResponse.unauthorized("Missing API key");
        }

        // presentedKey is expected to be the keyId string only
        Optional<Developer> maybeDev = apiKeyService.findDeveloperByKeyId(presentedKey);
        if (maybeDev.isEmpty()) {
            return JsonResponse.unauthorized("Invalid API key");
        }
        Developer dev = maybeDev.get();

        // Use ChannelService to fetch channels for this developer to avoid lazy-loading and cycles
        List<Channel> channels = channelService.findChannelsByDeveloperId(dev.getId());
        return JsonResponse.success(channels);
    }

    @DeleteMapping(path = "/channel/{channelId}")
    public JsonResponse deleteChannel(@PathVariable String channelId,
                                      @RequestHeader(value = ApiConstants.HEADER_API_KEY, required = false) String devApiKey) {
        // Demo mode: Use default API key if none provided
        if (CommonUtils.isEmpty(devApiKey)) {
            devApiKey = "demo-default-key";
        }
        
        boolean result = messageService.deleteChannel(channelId, devApiKey);
        if (result) return JsonResponse.success();
        return JsonResponse.error("Channel not found or operation unsupported");
    }


    @ExceptionHandler(Exception.class)
    public JsonResponse handleControllerError(Exception exception) {
        LOGGER.error("Messaging error:", exception);
        return JsonResponse.error(exception.getMessage());
    }

    private SessionInfo fetchSessionInfo(String sessionId) {
        if (sessionId == null) {
            throw new RuntimeException("Agent session not found");
        }

        SessionInfo sessionInfo = sessionManager.getSession(sessionId);
        if (sessionInfo != null) return sessionInfo;

        throw new RuntimeException("Agent session not found");
    }
}
