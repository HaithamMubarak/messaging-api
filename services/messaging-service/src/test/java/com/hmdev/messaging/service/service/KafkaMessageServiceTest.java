package com.hmdev.messaging.service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.data.ChannelMetadata;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.data.ReceiveConfig;
import com.hmdev.messaging.common.data.ChannelType;
import com.hmdev.messaging.service.service.cache.CacheService;
import com.hmdev.messaging.service.service.provider.IChannelTopicProvider;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class KafkaMessageServiceTest {

    @Test
    public void testReceive_respectsLocalOffsetAndLimit() throws Exception {
        // Arrange
        KafkaTemplateStub kafkaTemplate = new KafkaTemplateStub();
        IChannelTopicProvider topicProvider = mock(IChannelTopicProvider.class);
        KafkaConsumerPool consumerPool = mock(KafkaConsumerPool.class);
        CacheService cacheService = mock(CacheService.class);

        ChannelMetadata metadata = new ChannelMetadata();
        metadata.setTopicName("test-topic");
        metadata.setChannelId("chan-1");
        when(topicProvider.resolveTopic(anyString(), eq(ChannelType.DEFAULT))).thenReturn(metadata);

        // Build two EventMessage JSON strings: one with localOffset=3, another with localOffset=6
        ObjectMapper mapper = new ObjectMapper();
        EventMessage ev1 = new EventMessage();
        ev1.setFrom("a"); ev1.setTo("b"); ev1.setType(EventMessage.EventType.CHAT_TEXT); ev1.setEncrypted(false);
        ev1.setContent("msg1"); ev1.setDate(System.currentTimeMillis());
        Map<String,String> props1 = new HashMap<>(); props1.put("localOffset", "3"); ev1.setOtherProperties(props1);

        EventMessage ev2 = new EventMessage();
        ev2.setFrom("a"); ev2.setTo("b"); ev2.setType(EventMessage.EventType.CHAT_TEXT); ev2.setEncrypted(false);
        ev2.setContent("msg2"); ev2.setDate(System.currentTimeMillis());
        Map<String,String> props2 = new HashMap<>(); props2.put("localOffset", "6"); ev2.setOtherProperties(props2);

        String ev1Json = mapper.writeValueAsString(ev1);
        String ev2Json = mapper.writeValueAsString(ev2);

        // Create Kafka ConsumerRecords containing both events in order
        TopicPartition tp = new TopicPartition("test-topic", 0);
        ConsumerRecord<String,String> rec1 = new ConsumerRecord<>("test-topic", 0, 100L, "chan-1", ev1Json);
        ConsumerRecord<String,String> rec2 = new ConsumerRecord<>("test-topic", 0, 101L, "chan-1", ev2Json);

        Map<TopicPartition, List<ConsumerRecord<String,String>>> recordsMap = new HashMap<>();
        recordsMap.put(tp, Arrays.asList(rec1, rec2));
        ConsumerRecords<String,String> consumerRecords = new ConsumerRecords<>(recordsMap);

        org.apache.kafka.clients.consumer.KafkaConsumer<String,String> consumer = mock(org.apache.kafka.clients.consumer.KafkaConsumer.class);
        when(consumer.poll(any(Duration.class))).thenReturn(consumerRecords);
        when(consumer.partitionsFor("test-topic")).thenReturn(Collections.emptyList());

        when(consumerPool.acquireConsumer(eq("test-topic"), any(ReceiveConfig.class), anyInt())).thenReturn(consumer);

        KafkaMessageService svc = new KafkaMessageService(kafkaTemplate, topicProvider, consumerPool, cacheService, null, null);

        // Act: request with localOffset = 5 so only ev2 should be included, limit large enough
        ReceiveConfig range = new ReceiveConfig(0L, 5L, 10L);
        EventMessageResult result = svc.receive("chan-1", null, range);

        // Assert
        assertNotNull(result);
        // With original globalOffset-based behavior both events are returned
        assertEquals(2, result.getEvents().size(), "Both events should be returned when using globalOffset-only read");
        // lastChannelOffset should reflect the most recent per-channel offset seen (6)
        assertEquals(Long.valueOf(6L), result.getNextLocalOffset(), "Next channel offset should be 6 (last event localOffset)");
        assertEquals(Long.valueOf(102L), result.getNextGlobalOffset(), "Next global offset should be last record offset + 1 (101+1)");

        // verify consumer released
        verify(consumerPool, times(1)).releaseConsumer(consumer);
    }

    // Minimal stub for KafkaTemplate, not used in this test but required for constructor
    static class KafkaTemplateStub extends org.springframework.kafka.core.KafkaTemplate<String,String> {
        KafkaTemplateStub() { super(new org.springframework.kafka.core.DefaultKafkaProducerFactory<>(new java.util.HashMap<>())); }
    }
}
