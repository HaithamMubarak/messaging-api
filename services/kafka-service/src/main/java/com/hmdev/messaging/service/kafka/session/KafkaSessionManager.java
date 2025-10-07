package com.hmdev.messaging.service.kafka.session;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.session.GenericSessionManager;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Kafka-based session manager implementation.
 */
@Service
public class KafkaSessionManager implements GenericSessionManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaSessionManager.class);
    private static final String TOPIC = "session-store";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, Object> cache = new ConcurrentHashMap<>();

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @PostConstruct
    public void preloadCache() {
        LOGGER.info("Preloading all session mappings from Kafka topic: {}", TOPIC);

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "session-preload-" + UUID.randomUUID());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            consumer.subscribe(Collections.singletonList(TOPIC));

            int emptyPolls = 0;
            final int maxEmptyPolls = 5; // stop after 5 consecutive empty polls (~5s idle)
            int count = 0;

            while (emptyPolls < maxEmptyPolls) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

                if (records.isEmpty()) {
                    emptyPolls++;
                    continue;
                }

                emptyPolls = 0; // reset when we get data
                for (ConsumerRecord<String, String> record : records) {
                    if (record.value() != null) {
                        cache.put(record.key(), mapper.readValue(record.value(), Object.class));
                    } else {
                        cache.remove(record.key());
                    }
                    count++;
                }
            }

            LOGGER.info("Session cache preloaded: {} entries", count);

        } catch (Exception e) {
            LOGGER.error("Failed to preload Kafka sessions: {}", e.getMessage(), e);
        }
    }


    public KafkaSessionManager(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public <T> boolean put(String sessionId, T data) {
        try {
            String json = mapper.writeValueAsString(data);
            SendResult<String, String> sendResult = kafkaTemplate.send(TOPIC, sessionId, json).get(5, TimeUnit.SECONDS);
            if (sendResult != null) {
                cache.put(sessionId, data);
                LOGGER.debug("Stored session [{}] → {}", sessionId, data);
                return true;
            }

        } catch (Exception e) {
            LOGGER.error("Failed to store session {}: {}", sessionId, e.getMessage());
        }
        return false;
    }

    @Override
    public <T> T get(String sessionId, Class<T> type) {
        try {
            Object cached = cache.get(sessionId);
            if (type.isInstance(cached)) {
                LOGGER.debug("Cache hit for session {}", sessionId);
                return type.cast(cached);
            }

        } catch (Exception e) {
            LOGGER.error("Failed to get session {}: {}", sessionId, e.getMessage());
        }
        return null;
    }

    @Override
    public boolean remove(String sessionId) {
        try {
            kafkaTemplate.send(TOPIC, sessionId, null).get(5, TimeUnit.SECONDS);
            cache.remove(sessionId);
            LOGGER.debug("Removed session {}", sessionId);
            return true;
        } catch (Exception e) {
            LOGGER.error("Failed to remove session {}: {}", sessionId, e.getMessage());
            return false;
        }
    }

    @Override
    public Map<String, Object> getAllCached() {
        return Map.copyOf(cache);
    }
}
