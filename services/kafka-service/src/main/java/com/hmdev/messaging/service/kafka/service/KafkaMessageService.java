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
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class KafkaMessageService implements EventMessageService {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaMessageService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final AdminClient adminClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${messaging.kafka.replication-factor:1}")
    private short replicationFactor;

    @Value("${messaging.kafka.partitions:1}")
    private int partitions;

    @Value("${messaging.pollingTimeout:30000}")
    private long pollingTimeout;

    public KafkaMessageService(KafkaTemplate<String, String> kafkaTemplate, AdminClient adminClient) {
        this.kafkaTemplate = kafkaTemplate;
        this.adminClient = adminClient;
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
    public EventMessageResult receive(String channelId, String target, Range range) {

        List<EventMessage> events = new ArrayList<>();
        long updateLength = 0;

        setupTopic(channelId);

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "range-reader-" + UUID.randomUUID());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");

        long startOffset = range.getStart();
        long endOffset = range.getEnd();

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            List<TopicPartition> partitions = consumer.partitionsFor(channelId).stream()
                    .map(p -> new TopicPartition(channelId, p.partition()))
                    .collect(Collectors.toList());
            consumer.assign(partitions);

            for (TopicPartition tp : partitions) {
                consumer.seek(tp, startOffset);
            }

            long startTime = System.currentTimeMillis();
            while (System.currentTimeMillis() - startTime < pollingTimeout) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

                for (ConsumerRecord<String, String> rec : records) {
                    if (rec.offset() >= startOffset && rec.offset() <= endOffset) {
                        updateLength++;
                        try {
                            EventMessage event = mapper.readValue(rec.value(), EventMessage.class);

                            // check from matcher
                            if (matchesTarget(event, target)) {
                                events.add(event);
                            }

                        } catch (Exception ex) {
                            LOGGER.error("[Kafka Receive ERROR] Failed to parse event at offset {}: {}", rec.offset(), ex.getMessage());
                        }
                    }
                }

                if (!events.isEmpty()) break;
            }
        } catch (Exception e) {
            LOGGER.error("[Kafka Receive ERROR] Failed to read messages for channel {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException("Kafka receive error: " + e.getMessage(), e);
        }

        return new EventMessageResult(events, updateLength);
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

    private boolean matchesTarget(EventMessage eventMessage, String target) {
        String from = eventMessage.getFrom();
        String to = eventMessage.getTo();

        return !from.equals(target) && (CommonUtils.isEmpty(to) || to.equals(target) || target.matches(to));
    }
}
