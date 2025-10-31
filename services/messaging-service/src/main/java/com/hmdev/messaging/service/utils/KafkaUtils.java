package com.hmdev.messaging.service.utils;

import org.apache.kafka.clients.admin.AdminClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;
import java.util.concurrent.TimeUnit;

public final class KafkaUtils {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaUtils.class);

    private KafkaUtils() {
    }

    public static boolean topicExists(AdminClient adminClient, String topicName) {
        try {
            Set<String> topics = adminClient.listTopics().names().get(5, TimeUnit.SECONDS);
            return topics.contains(topicName);
        } catch (Exception e) {
            LOGGER.error("[Kafka] Failed to check topic existence '{}': {}", topicName, e.getMessage(), e);
            return false;
        }
    }
}
