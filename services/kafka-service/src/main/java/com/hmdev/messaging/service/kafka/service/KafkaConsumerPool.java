package com.hmdev.messaging.service.kafka.service;

import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.Range;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;


public class KafkaConsumerPool {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaConsumerPool.class);

    private final BlockingQueue<KafkaConsumer<String, String>> pool;
    private final String bootstrapServers;
    private final int poolSize;

    public KafkaConsumerPool(String bootstrapServers, int poolSize) {
        this.bootstrapServers = bootstrapServers;
        this.pool = new LinkedBlockingQueue<>();
        this.poolSize = poolSize;

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

    public KafkaConsumer<String, String> acquireConsumer(String channelId, Range range, int timeoutInSeconds) throws InterruptedException {
        LOGGER.debug("Attempting to acquire consumer for topic '{}' (offset {} to {})...",
                channelId, range.getStart(), range.getEnd());

        KafkaConsumer<String, String> consumer = pool.poll(timeoutInSeconds, TimeUnit.SECONDS);
        if (consumer != null) {
            // Assign to topic partitions
            List<TopicPartition> partitions = consumer.partitionsFor(channelId).stream()
                    .map(p -> new TopicPartition(channelId, p.partition()))
                    .collect(Collectors.toList());
            consumer.assign(partitions);

            // Seek to start offset
            for (TopicPartition tp : partitions) {
                consumer.seek(tp, range.getStart());
            }

            LOGGER.debug("Consumer assigned to topic '{}' with {} partitions starting at offset {}.",
                    channelId, partitions.size(), range.getStart());
        } else {
            LOGGER.warn("No available consumers in pool (waited {}s). Request for '{}' rejected.",
                    timeoutInSeconds, channelId);
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
