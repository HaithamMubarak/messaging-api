package com.hmdev.messaging.service.service;

import com.hmdev.messaging.common.data.ReceiveConfig;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Component
public class KafkaConsumerPool {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaConsumerPool.class);

    private BlockingQueue<KafkaConsumer<String, String>> pool;

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumers.pool.size:10}")
    private int poolSize;

    @PostConstruct
    public void init() {
        this.pool = new LinkedBlockingQueue<>();
        for (int i = 0; i < poolSize; i++) {
            pool.add(createConsumer());
        }
    }

    private KafkaConsumer<String, String> createConsumer() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "range-reader-" + UUID.randomUUID());
        return new KafkaConsumer<>(props);
    }

    public KafkaConsumer<String, String> acquireConsumer(String topicName, ReceiveConfig receiveConfig,
                                                         int timeoutInSeconds) throws InterruptedException {
        Long globalOffset = receiveConfig.getGlobalOffset();
        Long limit = receiveConfig.getLimit();
        LOGGER.debug("Attempting to acquire consumer for topic '{}' (globalOffset {} with limit {})...",
                topicName, globalOffset, limit);

        KafkaConsumer<String, String> consumer = pool.poll(timeoutInSeconds, TimeUnit.SECONDS);
        if (consumer != null) {
            // Assign to topic partitions
            List<TopicPartition> partitions = consumer.partitionsFor(topicName).stream()
                    .map(p -> new TopicPartition(topicName, p.partition()))
                    .collect(Collectors.toList());
            consumer.assign(partitions);
            consumer.beginningOffsets(partitions);
            // Seek to start offset
            long seekTo = (globalOffset != null) ? globalOffset : 0L;
            for (TopicPartition tp : partitions) {
                consumer.seek(tp, seekTo);
            }

            LOGGER.debug("Consumer assigned to topic '{}' with {} partitions starting at offset {}.",
                    topicName, partitions.size(), seekTo);
        } else {
            LOGGER.warn("No available consumers in pool (waited {}s). Request for '{}' rejected.",
                    timeoutInSeconds, topicName);
        }
        return consumer;
    }

    public boolean releaseConsumer(KafkaConsumer<String, String> consumer) {
        if (consumer != null) {
            try {
                consumer.unsubscribe();
            } catch (Exception e) {
                LOGGER.warn("Error while trying to unsubscribe consumer '{}'.", consumer, e);
            }

            try {
                boolean success = pool.offer(consumer);
                if (success) {
                    LOGGER.debug("Consumer successfully released back into pool. Pool size: {}/{}",
                            pool.size(), poolSize);
                } else {
                    LOGGER.warn("Consumer release failed — pool might be full. Current size: {}/{}",
                            pool.size(), poolSize);
                }
                return success;
            } catch (Exception e) {
                LOGGER.error("Error releasing consumer back to pool: {}", e.getMessage(), e);

            }
        }

        return false;
    }

    public void shutdown() {
        LOGGER.info("Shutting down KafkaConsumerPool ({} consumers)...", pool.size());
        for (KafkaConsumer<String, String> consumer : pool) {
            try {
                consumer.wakeup();
                consumer.close();
            } catch (Exception e) {
                LOGGER.warn("Error closing consumer: {}", e.getMessage());
            }
        }
        pool.clear();
        LOGGER.info("KafkaConsumerPool shutdown complete.");
    }
}
