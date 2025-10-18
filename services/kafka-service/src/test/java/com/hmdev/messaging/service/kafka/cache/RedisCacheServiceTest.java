package com.hmdev.messaging.service.kafka.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.data.EventMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RedisCacheServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RedisCacheService cacheService;

    @Captor
    ArgumentCaptor<String> keyCaptor;

    @Captor
    ArgumentCaptor<String> valueCaptor;

    @BeforeEach
    public void setup() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        // CacheProperties is constructor-bound; pass nulls to use default values
        CacheProperties props = new CacheProperties(null, null, null, null, null, null);
        cacheService = new RedisCacheService(redisTemplate, objectMapper, props);
    }

    @Test
    public void putAndGetKafkaMessage_serializesAndDeserializes() throws Exception {
        EventMessage message = new EventMessage("alice", "bob", EventMessage.EventType.CHAT_TEXT, false, "hello", 123L);
        String cacheKey = "channel1:10";

        // act: put message
        cacheService.putKafkaMessage(cacheKey, message);

        // verify set called with expected key and some JSON value and TTL
        verify(valueOperations, times(1)).set(keyCaptor.capture(), valueCaptor.capture(), eq(Duration.ofSeconds(CacheProperties.DEFAULT_KAFKA_MESSAGE_TTL_SECONDS)));
        String usedKey = keyCaptor.getValue();
        String storedJson = valueCaptor.getValue();

        assertEquals(CacheProperties.DEFAULT_KAFKA_MSG_PREFIX + cacheKey, usedKey);
        assertNotNull(storedJson);

        // mock get to return the stored JSON and then read it back
        when(valueOperations.get(usedKey)).thenReturn(storedJson);

        EventMessage result = cacheService.getKafkaMessage(cacheKey, EventMessage.class);
        assertNotNull(result);
        assertEquals(message.getFrom(), result.getFrom());
        assertEquals(message.getTo(), result.getTo());
        assertEquals(message.getContent(), result.getContent());
    }

    @Test
    public void getSession_returnsNullWhenMissing() throws Exception {
        String sessionId = "nonexistent";
        when(valueOperations.get(CacheProperties.DEFAULT_SESSION_PREFIX + sessionId)).thenReturn(null);

        Object result = cacheService.getSession(sessionId, Object.class);
        assertNull(result);
    }
}
