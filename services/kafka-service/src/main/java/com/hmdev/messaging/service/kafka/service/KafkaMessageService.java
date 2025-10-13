package com.hmdev.messaging.service.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.data.Range;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.service.kafka.utils.KafkaUtils;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class KafkaMessageService implements EventMessageService {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaMessageService.class);
    private static final  int CONSUMERS_POOL_SIZE = 10;

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final AdminClient adminClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${messaging.kafka.replication-factor:1}")
    private short replicationFactor;

    @Value("${messaging.kafka.partitions:1}")
    private int partitions;

    @Value("${messaging.pollingTimeout:35}")
    private long pollingTimeout;

    private KafkaConsumerPool kafkaConsumerPool;

    public KafkaMessageService(KafkaTemplate<String, String> kafkaTemplate, AdminClient adminClient) {
        this.kafkaTemplate = kafkaTemplate;
        this.adminClient = adminClient;
    }

    @PostConstruct
    public void initialize() throws Exception {
        this.kafkaConsumerPool = new KafkaConsumerPool(bootstrapServers, CONSUMERS_POOL_SIZE);
    }

    @Override
    public void send(String channelId, EventMessage event) {
        try {
            setupTopic(channelId);

            String payload = mapper.writeValueAsString(event);

            SendResult<String, String> result = kafkaTemplate.send(channelId, channelId, payload).get(10, TimeUnit.SECONDS);

            if (result != null && result.getRecordMetadata() != null) {
                LOGGER.debug(
                        "[Kafka Send] Channel={} | Partition={} | Offset={} | Key={}",
                        channelId,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        channelId
                );
            }
        } catch (Exception e) {
            LOGGER.error("[Kafka Send ERROR] Failed to send message to channel {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException("Failed to send Kafka message: " + e.getMessage(), e);
        }
    }

    @Override
    public EventMessageResult receive(String channelId, String recipientName, Range range) {

        setupTopic(channelId);

        KafkaConsumer<String, String> consumer = null;
        try {
            consumer = this.kafkaConsumerPool.acquireConsumer(channelId, range, 3);
            if (consumer == null)
            {
               throw new RuntimeException("Failed to acquire a kafka consumer for channelId: " + channelId);
            }

            List<EventMessage> events = new ArrayList<>();
            long updateLength = 0;

            long startTime = System.currentTimeMillis();
            while (System.currentTimeMillis() - startTime < (pollingTimeout * 1000)) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

                for (ConsumerRecord<String, String> rec : records) {
                    if (rec.offset() >= range.getStart() && rec.offset() <= range.getEnd()) {
                        updateLength++;
                        try {
                            EventMessage event = mapper.readValue(rec.value(), EventMessage.class);

                            // check from src/dest matching
                            if (matchRecipient(event, recipientName)) {
                                events.add(event);
                            }
                        } catch (Exception ex) {
                            LOGGER.error("[Kafka Receive ERROR] Failed to parse event at offset {}: {}", rec.offset(), ex.getMessage());
                        }
                    }
                }

                if (!events.isEmpty()) break;
            }

            return new EventMessageResult(events, updateLength);

        } catch (Exception e) {
            LOGGER.error("[Kafka Receive ERROR] Failed to read messages for channel {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException("Kafka receive error: " + e.getMessage(), e);
        } finally {
            if (consumer != null) {
                this.kafkaConsumerPool.releaseConsumer(consumer);
            }
        }
    }

    @Override
    public boolean clean(String channelId) {
        try {
            adminClient.deleteTopics(Collections.singletonList(channelId))
                    .all().get(5, TimeUnit.SECONDS);
            LOGGER.debug("[Kafka] Deleted topic '{}'", channelId);
            return true;
        } catch (Exception e) {
            LOGGER.error("[Kafka] Failed to delete topic '{}': {}", channelId, e.getMessage(), e);
            return false;
        }
    }

    private void setupTopic(String topicName) {
        try {
            if (!KafkaUtils.topicExists(adminClient, topicName)) {
                NewTopic topic = new NewTopic(topicName, partitions, replicationFactor);
                adminClient.createTopics(Collections.singletonList(topic))
                        .all().get(5, TimeUnit.SECONDS);
                LOGGER.debug("[Kafka] Created topic '{}' (partitions={}, replication={})",
                        topicName, partitions, replicationFactor);
            }
        } catch (Exception e) {
            LOGGER.error("[Kafka] Error ensuring topic exists '{}': {}", topicName, e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    private boolean matchRecipient(EventMessage eventMessage, String recipient) {
        if (recipient == null) {
            return true;
        }

        String from = eventMessage.getFrom();
        String to = eventMessage.getTo();

        return !from.equals(recipient) && (CommonUtils.isEmpty(to) || to.equals(recipient) || recipient.matches(to));
    }
}
