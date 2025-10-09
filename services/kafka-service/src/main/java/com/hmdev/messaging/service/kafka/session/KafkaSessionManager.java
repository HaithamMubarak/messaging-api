package com.hmdev.messaging.service.kafka.session;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.data.AgentInfo;
import com.hmdev.messaging.common.session.GenericSessionManager;
import com.hmdev.messaging.common.session.SessionInfo;
import com.hmdev.messaging.service.kafka.utils.KafkaUtils;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class KafkaSessionManager implements GenericSessionManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaSessionManager.class);

    private final ConcurrentHashMap<String, SessionInfo> sessionCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, List<AgentInfo>> channelCache = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private static final String SESSION_STORE_TOPIC = "session-store";

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    private final AdminClient adminClient;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaSessionManager(AdminClient adminClient, KafkaTemplate<String, String> kafkaTemplate) {
        this.adminClient = adminClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Initialize cache sync at startup.
     * Loads existing session data and then starts a background Kafka listener.
     */
    @PostConstruct
    public void initialize() {
        LOGGER.info("Initializing KafkaSessionManager...");

        setupTopic(SESSION_STORE_TOPIC);

        // Initialize cache sync at startup.
        preloadSessions();

        // Start cache listener
        new Thread(this::startKafkaCacheListener, "session-cache-listener").start();

        LOGGER.info("KafkaSessionManager initialized successfully.");
    }

    @Override
    public void putSession(String sessionId, SessionInfo info) {
        try {
            String json = mapper.writeValueAsString(info);
            SendResult<String, String> result = kafkaTemplate.send(SESSION_STORE_TOPIC, sessionId, json).get(3, TimeUnit.SECONDS);
            LOGGER.debug("Session added to Kafka: {}, Kafka send result is {}", sessionId, result);
        } catch (Exception e) {
            LOGGER.error("Failed to publish session {}: {}", sessionId, e.getMessage());
        }
    }

    @Override
    public SessionInfo getSession(String sessionId) {
        return sessionCache.get(sessionId);
    }

    @Override
    public List<AgentInfo> getAgentsByChannel(String channelId) {
        return channelCache.getOrDefault(channelId, Collections.emptyList());
    }

    @Override
    public void removeSession(String sessionId) {
        try {
            kafkaTemplate.send(SESSION_STORE_TOPIC, sessionId, null);
            LOGGER.debug("Session removed from Kafka: {}", sessionId);
        } catch (Exception e) {
            LOGGER.error("Failed to remove session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Step 1️⃣: Read all existing session records from the beginning (only once).
     */
    private void preloadSessions() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "session-preload-" + UUID.randomUUID());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            consumer.subscribe(Collections.singletonList(SESSION_STORE_TOPIC));

            Map<String, SessionInfo> tempSessionCache = new HashMap<>();
            Map<String, List<AgentInfo>> tempChannelCache = new HashMap<>();

            LOGGER.info("Loading existing sessions from Kafka topic '{}'...", SESSION_STORE_TOPIC);
            int emptyPolls = 0;
            int maxEmptyPolls = 5;
            long total = 0;

            while (emptyPolls < maxEmptyPolls) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(2));

                if (records.isEmpty()) {
                    emptyPolls++;
                    continue;
                }

                emptyPolls = 0;

                for (ConsumerRecord<String, String> record : records) {
                    String key = record.key();
                    String value = record.value();

                    if (value != null) {
                        SessionInfo sessionInfo = mapper.readValue(value, SessionInfo.class);
                        tempSessionCache.put(key, sessionInfo);

                        tempChannelCache
                                .computeIfAbsent(sessionInfo.getChannelId(), k -> new ArrayList<>())
                                .add(sessionInfo.getAgentInfo());

                    } else {
                        tempSessionCache.remove(key);
                    }

                    total++;
                }

                if (total % 5000 == 0) {
                    LOGGER.info("Loaded {} session records so far...", total);
                }
            }

            // Atomic swap — replace old cache with fresh data
            sessionCache.clear();
            sessionCache.putAll(tempSessionCache);

            channelCache.clear();
            channelCache.putAll(tempChannelCache);

            LOGGER.info("Preload complete. Sessions: {} | Channels: {}",
                    sessionCache.size(), channelCache.size());

        } catch (Exception e) {
            LOGGER.error("Error preloading session cache: {}", e.getMessage(), e);
        }
    }


    /**
     * Step 2️⃣: Continuous Kafka listener for live updates.
     * Keeps all pod caches synchronized.
     */
    private void startKafkaCacheListener() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "session-cache-sync-" + UUID.randomUUID());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            consumer.subscribe(Collections.singletonList(SESSION_STORE_TOPIC));
            LOGGER.info("SessionCacheListener subscribed to '{}'", SESSION_STORE_TOPIC);

            while (true) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
                for (ConsumerRecord<String, String> record : records) {
                    String key = record.key();
                    String value = record.value();

                    if (value != null) {
                        SessionInfo info = mapper.readValue(value, SessionInfo.class);
                        sessionCache.put(key, info);

                        channelCache.computeIfAbsent(info.getChannelId(), k -> new ArrayList<>())
                                .add(info.getAgentInfo());
                        LOGGER.debug("Cache updated [ADD] session={} channel={}", key, info.getChannelId());
                    } else {
                        SessionInfo removed = sessionCache.remove(key);
                        if (removed != null) {
                            String agentName = removed.getAgentInfo().getAgentName();
                            channelCache.computeIfPresent(removed.getChannelId(), (ch, list) -> {
                                list.removeIf(agent -> agent.getAgentName().equals(agentName));
                                return list.isEmpty() ? null : list;
                            });
                        }
                        LOGGER.debug("Cache updated [REMOVE] session={}", key);
                    }
                }
                Utils.sleep(1000);
            }

        } catch (Exception e) {
            LOGGER.error("Session cache listener stopped: {}", e.getMessage(), e);
        }
    }

    private void setupTopic(String topicName) {
        try {
            if (!KafkaUtils.topicExists(adminClient, topicName)) {
                NewTopic topic = new NewTopic(topicName, 3, (short) 1)
                        .configs(Map.of(
                                "cleanup.policy", "compact",
                                "min.cleanable.dirty.ratio", "0.01",
                                "segment.ms", "600000" // 10 min segment cleanup cycle
                        ));

                adminClient.createTopics(Collections.singletonList(topic))
                        .all()
                        .get(10, TimeUnit.SECONDS);

                LOGGER.info("[Kafka] Created topic '{}' (partitions={}, replication={})",
                        topicName, 3, 1);
            } else {
                LOGGER.debug("[Kafka] Topic '{}' already exists", topicName);
            }
        } catch (Exception e) {
            LOGGER.error("[Kafka] Error ensuring topic exists '{}': {}", topicName, e.getMessage(), e);
        }
    }


}