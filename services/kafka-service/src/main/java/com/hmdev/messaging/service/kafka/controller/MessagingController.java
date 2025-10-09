package com.hmdev.messaging.service.kafka.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hmdev.messaging.common.data.AgentInfo;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.security.MySecurity;
import com.hmdev.messaging.common.session.SessionInfo;
import com.hmdev.messaging.common.session.GenericSessionManager;
import com.hmdev.messaging.service.kafka.data.*;
import com.hmdev.messaging.service.kafka.service.KafkaMessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "/messaging-api/kafka-service", produces = MediaType.APPLICATION_JSON_VALUE)
public class MessagingController {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessagingController.class);

    private final KafkaMessageService kafkaMessageService;
    private final GenericSessionManager sessionManager;

    @Autowired
    public MessagingController(KafkaMessageService kafkaMessageService,
                               GenericSessionManager sessionManager) {
        this.kafkaMessageService = kafkaMessageService;
        this.sessionManager = sessionManager;
    }

    @PostMapping(path = "/connect", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object connect(@RequestBody(required = false) ConnectRequest connectRequest) throws JsonProcessingException {
        long timestamp = System.currentTimeMillis();

        String channelId = MySecurity.deriveChannelSecret(connectRequest.getChannelName(),
                connectRequest.getChannelPassword());
        String sessionId = java.util.UUID.randomUUID().toString();

        AgentInfo agentInfo = new AgentInfo(connectRequest.getAgentName(), timestamp,
                connectRequest.getAgentContext());

        kafkaMessageService.send(channelId, new EventMessage(connectRequest.getAgentName(), "connect", false, null, timestamp));
        sessionManager.putSession(sessionId, new SessionInfo(channelId, agentInfo));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("channelId", channelId);
        payload.put("sessionId", sessionId);
        payload.put("date", timestamp);

        return JsonResponse.ok(payload);
    }

    @PostMapping(path = "/event", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object sendEvent(@RequestBody(required = false) EventMessageRequest eventMessageRequest) {

        long timestamp = System.currentTimeMillis();

        SessionInfo sessionInfo = checkSessionInfo(eventMessageRequest.getSessionId());
        sessionInfo.getAgentInfo().setDate(timestamp);

        // Update session timestamp
        sessionManager.putSession(eventMessageRequest.getSessionId(), sessionInfo);

        kafkaMessageService.send(sessionInfo.getChannelId(),
                new EventMessage(sessionInfo.getAgentInfo().getAgentName(), eventMessageRequest.getType(),
                        eventMessageRequest.isEncrypted(), eventMessageRequest.getContent(), timestamp));

        return JsonResponse.ok();
    }

    @PostMapping(path = "/list-agents")
    public JsonResponse listAgents(@RequestBody(required = false) SessionRequest sessionRequest) {

        long timestamp = System.currentTimeMillis();

        SessionInfo sessionInfo = checkSessionInfo(sessionRequest.getSessionId());
        sessionInfo.getAgentInfo().setDate(timestamp);

        // Update session timestamp
        sessionManager.putSession(sessionRequest.getSessionId(), sessionInfo);

        List<AgentInfo> activeAgents = sessionManager.getAgentsByChannel(sessionInfo.getChannelId());
        return JsonResponse.ok(activeAgents);
    }

    @PostMapping(path = "/receive", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse receive(@RequestBody(required = false) MessageReceiveRequest messageReceiveRequest) {
        long timestamp = System.currentTimeMillis();

        SessionInfo sessionInfo = checkSessionInfo(messageReceiveRequest.getSessionId());
        EventMessageResult eventMessageResult =
                kafkaMessageService.receive(sessionInfo.getChannelId(), sessionInfo.getAgentInfo().getAgentName(), messageReceiveRequest.getRange());

        return JsonResponse.ok(eventMessageResult);
    }

    @PostMapping(path = "/disconnect", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object disconnect(@RequestBody(required = false) SessionRequest sessionRequest) {
        long timestamp = System.currentTimeMillis();
        SessionInfo sessionInfo = checkSessionInfo(sessionRequest.getSessionId());
        AgentInfo agentInfo = sessionInfo.getAgentInfo();
        kafkaMessageService.send(sessionInfo.getChannelId(), new EventMessage(agentInfo.getAgentName(), "disconnect", false, null, timestamp));
        sessionManager.removeSession(sessionRequest.getSessionId());

        return JsonResponse.ok();
    }


    @ExceptionHandler(Exception.class)
    public JsonResponse handleControllerError(Exception exception) {
        LOGGER.error("Messaging error", exception);
        return JsonResponse.error(exception.getMessage());
    }

    private SessionInfo checkSessionInfo(String sessionId) {
        SessionInfo sessionInfo = sessionManager.getSession(sessionId);

        if (sessionInfo == null) {
            throw new RuntimeException("Agent session not found");
        }

        return sessionInfo;
    }
}
