package com.hmdev.messaging.service.kafka.controller;

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
import org.springframework.messaging.MessagingException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

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
    public Object connect(@RequestBody(required = false) ConnectRequest connectRequest)  {
        long timestamp = System.currentTimeMillis();

        String channelId = MySecurity.deriveChannelSecret(connectRequest.getChannelName(),
                connectRequest.getChannelPassword());

        String agentName = connectRequest.getAgentName();

        boolean agentExists = sessionManager.getAgentsByChannel(channelId).stream()
                .map(AgentInfo::getAgentName)
                .anyMatch(agentName::equals);

        boolean sessionExists = false;
        String sessionId = null;

        if (agentExists) {
            SessionInfo sessionInfo;
            // Checks agent re-connect operation if the agent wasn't disconnected properly before
            // 1 - A valid session ID should be sent
            // 2 - The same agent name as the previous session should be used
            if (connectRequest.getSessionId() != null && (sessionInfo = sessionManager.getSession(connectRequest.getSessionId())) != null
                    && Objects.equals(sessionInfo.getAgentInfo().getAgentName(), agentName)) {
                sessionId = connectRequest.getSessionId();
                sessionExists = true;
            } else {
                throw new MessagingException("This agent name is currently unavailable as it is already being used by another session.");
            }
        }

        // Creates new session id.
        if(sessionId == null)
        {
            sessionId = java.util.UUID.randomUUID().toString();
        }

        AgentInfo agentInfo = new AgentInfo(agentName, timestamp, connectRequest.getAgentContext());

        if (!sessionExists)
        {
            kafkaMessageService.send(channelId, new EventMessage(agentName, ".*", EventMessage.EventType.CONNECT,
                    false, null, timestamp));
        }
        sessionManager.putSession(sessionId, new SessionInfo(channelId, agentInfo));

        ConnectResponse connectResponse = new ConnectResponse();
        connectResponse.setSessionId(sessionId);
        connectResponse.setChannelId(channelId);
        connectResponse.setDate(timestamp);

        return JsonResponse.success(connectResponse);
    }

    @PostMapping(path = "/event", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object sendEvent(@RequestBody(required = false) EventMessageRequest eventMessageRequest) {

        long timestamp = System.currentTimeMillis();

        SessionInfo sessionInfo = fetchSessionInfo(eventMessageRequest.getSessionId());
        sessionInfo.getAgentInfo().setDate(timestamp);

        // Update session timestamp
        sessionManager.putSession(eventMessageRequest.getSessionId(), sessionInfo);

        EventMessage eventMessage = new EventMessage(eventMessageRequest);
        eventMessage.setFrom(sessionInfo.getAgentInfo().getAgentName());

        kafkaMessageService.send(sessionInfo.getChannelId(), eventMessage);

        return JsonResponse.success();
    }

    @PostMapping(path = "/list-agents")
    public JsonResponse listAgents(@RequestBody(required = false) SessionRequest sessionRequest) {

        long timestamp = System.currentTimeMillis();

        SessionInfo sessionInfo = fetchSessionInfo(sessionRequest.getSessionId());
        sessionInfo.getAgentInfo().setDate(timestamp);

        // Update session timestamp
        sessionManager.putSession(sessionRequest.getSessionId(), sessionInfo);

        List<AgentInfo> activeAgents = sessionManager.getAgentsByChannel(sessionInfo.getChannelId());
        return JsonResponse.success(activeAgents);
    }

    @PostMapping(path = "/receive", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JsonResponse receive(@RequestBody(required = false) MessageReceiveRequest messageReceiveRequest) {

        SessionInfo sessionInfo = fetchSessionInfo(messageReceiveRequest.getSessionId());
        EventMessageResult eventMessageResult =
                kafkaMessageService.receive(sessionInfo.getChannelId(), sessionInfo.getAgentInfo().getAgentName(), messageReceiveRequest.getRange());

        return JsonResponse.success(eventMessageResult);
    }

    @PostMapping(path = "/disconnect", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object disconnect(@RequestBody(required = false) SessionRequest sessionRequest) {
        long timestamp = System.currentTimeMillis();
        SessionInfo sessionInfo = fetchSessionInfo(sessionRequest.getSessionId());
        AgentInfo agentInfo = sessionInfo.getAgentInfo();
        kafkaMessageService.send(sessionInfo.getChannelId(), new EventMessage(agentInfo.getAgentName(), ".*",
                EventMessage.EventType.DISCONNECT, false, null, timestamp));
        sessionManager.removeSession(sessionRequest.getSessionId());

        return JsonResponse.success();
    }


    @ExceptionHandler(Exception.class)
    public JsonResponse handleControllerError(Exception exception) {
        LOGGER.error("Messaging error", exception);
        return JsonResponse.error(exception.getMessage());
    }

    private SessionInfo fetchSessionInfo(String sessionId) {

        SessionInfo sessionInfo;
        if (sessionId == null || (sessionInfo = sessionManager.getSession(sessionId)) == null) {
            throw new RuntimeException("Agent session not found");
        }

        return sessionInfo;
    }
}
