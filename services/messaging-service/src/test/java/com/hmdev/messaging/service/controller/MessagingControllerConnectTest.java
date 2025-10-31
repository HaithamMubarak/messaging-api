package com.hmdev.messaging.service.controller;

import com.hmdev.messaging.common.data.ChannelMetadata;
import com.hmdev.messaging.common.data.ConnectRequest;
import com.hmdev.messaging.service.data.JsonResponse;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.service.ChannelService;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.common.session.GenericSessionManager;
import com.hmdev.messaging.service.service.ApiKeyService;
import com.hmdev.messaging.service.utils.lock.LockRegisterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class MessagingControllerConnectTest {

    @Mock
    private EventMessageService<Channel> messageService;

    @Mock
    private GenericSessionManager sessionManager;

    @Mock
    private LockRegisterService lockRegisterService;

    @Mock
    private ChannelService channelService;

    @Mock
    private ApiKeyService apiKeyService;

    private MessagingController controller;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        controller = new MessagingController(messageService, sessionManager, lockRegisterService, channelService, apiKeyService);
    }

    @Test
    public void connect_rejectsReservedAgentName() {
        // Arrange
        ConnectRequest req = new ConnectRequest();
        req.setChannelName("chan");
        req.setChannelPassword("pw");
        req.setAgentName("bannedUser");

        ChannelMetadata meta = new ChannelMetadata();
        meta.setAllowedAgentsNames(List.of("bannedUser", "admin*"));

        Channel channel = new Channel();
        channel.setChannelId("chanId");
        channel.setMetadata(meta);

        when(lockRegisterService.registerLock(anyString())).thenReturn("token");
        when(messageService.createChannel(anyString(), anyString(), anyString(), anyString())).thenReturn(channel);
        when(channelService.findByChannelId(anyString())).thenReturn(Optional.of(channel));

        // Act
        Object result = controller.connect(req, "devKey");

        // Assert
        assertTrue(result instanceof JsonResponse);
        JsonResponse resp = (JsonResponse) result;
        assertEquals("error", resp.status);
        assertTrue(resp.statusMessage.contains("Agent name unavailable"));

        // verify lock registered
        verify(lockRegisterService, times(1)).registerLock(anyString());
    }
}
