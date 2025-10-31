package com.hmdev.messaging.service.service.provider;


import com.hmdev.messaging.common.data.ChannelType;
import com.hmdev.messaging.common.data.ChannelMetadata;
import com.hmdev.messaging.service.utils.KafkaUtils;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.concurrent.TimeUnit;


@Component
public class ChannelTopicProviderImpl implements IChannelTopicProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChannelTopicProviderImpl.class);
    private final AdminClient adminClient;

    private static final String CHANNEL_TOPIC_PREFIX = "messaging-platform-";
    private static final int DEFAULT_CHANNEL_TOPICS_COUNT = 50;

    @Value("${messaging.kafka.replication-factor:1}")
    private short replicationFactor;

    @Value("${messaging.kafka.partitions:1}")
    private int partitions;

    public ChannelTopicProviderImpl(AdminClient adminClient) {
        this.adminClient = adminClient;
    }

    @Override
    public ChannelMetadata resolveTopic(String channelId, ChannelType channelType) {
        String topicName = this.channelIdToKafkaTopic(channelId, channelType);
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
        return new ChannelMetadata(topicName, channelId);
    }

    private String channelIdToKafkaTopic(String channelId, ChannelType channelType) {
        if (channelType != ChannelType.DEFAULT)
        {
            throw new RuntimeException("Unsupported channel type " + channelType);
        }
        return CHANNEL_TOPIC_PREFIX + Math.abs(channelId.hashCode() % DEFAULT_CHANNEL_TOPICS_COUNT);
    }

    /**
     * todo: this might be used in the future for topic/channel clean ups
     *
     * @param kafkaTopic the kafka topic name
     * @return the result of delete
     */
    public boolean delete(String kafkaTopic) {
        try {
            adminClient.deleteTopics(Collections.singletonList(kafkaTopic))
                    .all().get(5, TimeUnit.SECONDS);
            LOGGER.debug("[Kafka] Deleted topic '{}'", kafkaTopic);
            return true;
        } catch (Exception e) {
            LOGGER.error("[Kafka] Failed to delete topic '{}': {}", kafkaTopic, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean deleteTopic(String topicName) {
        return delete(topicName);
    }
}
