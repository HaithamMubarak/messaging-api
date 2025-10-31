package com.hmdev.messaging.service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.*;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.service.service.provider.IChannelTopicProvider;
import com.hmdev.messaging.service.utils.Utils;
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

import com.hmdev.messaging.service.service.cache.CacheService;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.data.model.Developer;

@Service
public class KafkaMessageService implements EventMessageService<Channel> {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaMessageService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final KafkaConsumerPool kafkaConsumerPool;
    private final IChannelTopicProvider channelTopicProvider;
    private final CacheService cacheService;
    private final ChannelService channelService;
    private final ApiKeyService apiKeyService;

    @Value("${messaging.pollingTimeout:35}")
    private long pollingTimeout;

    public KafkaMessageService(KafkaTemplate<String, String> kafkaTemplate, IChannelTopicProvider channelTopicProvider,
                               KafkaConsumerPool kafkaConsumerPool, CacheService cacheService, ChannelService channelService, ApiKeyService apiKeyService) {
        this.kafkaTemplate = kafkaTemplate;
        this.channelTopicProvider = channelTopicProvider;
        this.kafkaConsumerPool = kafkaConsumerPool;
        this.cacheService = cacheService;
        this.channelService = channelService;
        this.apiKeyService = apiKeyService;
    }

    @Override
    public ChannelMetadata send(String channelId, EventMessage event) {
        try {
            // Do NOT create channel here: send should assume the channel exists. Fail fast if missing.
            Optional<Channel> maybeChannel = channelService.findByChannelId(channelId);
            if (maybeChannel.isEmpty()) {
                throw new RuntimeException("Channel does not exist. Create the channel before sending messages.");
            }
            Channel channel = maybeChannel.get();
            ChannelMetadata channelMetadata = channel.getMetadata();

            long channelOffset = cacheService.allocateLocalOffset(channelId);
            event.getOtherProperties().put("localOffset", String.valueOf(channelOffset));

            String payload = mapper.writeValueAsString(event);

            String topicName = channelMetadata.getTopicName();
            String topicKey = channelMetadata.getChannelId();

            SendResult<String, String> result = kafkaTemplate.send(topicName, topicKey, payload).get(5, TimeUnit.SECONDS);

            if (result != null && result.getRecordMetadata() != null) {
                LOGGER.debug(
                        "[Kafka Send] Channel={} | Topic={} | Partition={} | Offset={} | Key={}",
                        channelId,
                        topicName,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        topicKey
                );

                channelMetadata.setGlobalOffset(result.getRecordMetadata().offset());
                channelMetadata.setLocalOffset(channelOffset);
                cacheService.putEventMessage(channelId, channelOffset, event);

                channelService.updateChannel(channel);

            }

            return channelMetadata;
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            LOGGER.error("[Kafka Send ERROR] Failed to send message to channel {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException("Failed to send Kafka message: " + e.getMessage(), e);
        }
    }

    /**
     * Create a channel (DB record + ensure Kafka topic) using an API key. If the channel already exists, returns the existing Channel.
     * This method is intended to be called from controller during connect/create operations.
     */
    @Override
    public Channel createChannel(String channelId, String devApiKey, String channelName,
                                                        String channelPassword) {

        Channel channel = channelService.findByChannelId(channelId).orElse(null);

        // create channel if not exists
        if (channel == null) {
            if (CommonUtils.isEmpty(devApiKey)) {
                throw new RuntimeException("Missing API key to create channel");
            }

            Optional<Developer> developerOptional = apiKeyService.findDeveloperByKeyId(devApiKey);
            if (developerOptional.isEmpty()) {
                throw new RuntimeException("Invalid API key");
            }
            Developer developer = developerOptional.get();

            ChannelMetadata channelMetadata = channelTopicProvider.resolveTopic(channelId, ChannelType.DEFAULT);
            channelMetadata.setChannelName(channelName);
            channelMetadata.setChannelPassword(channelPassword);
            channelMetadata.setGlobalOffset(0L);
            channelMetadata.setLocalOffset(0L);
            channel = channelService.createChannel(developer, channelMetadata);
        }

        if (channel != null) {
            ChannelMetadata channelMetadata = channelTopicProvider.resolveTopic(channelId, ChannelType.DEFAULT);
            channelMetadata.setChannelName(channelName);
            channelMetadata.setChannelPassword(channelPassword);
            return channel;
        } else {
            throw new RuntimeException("Unable to create channel for id: " + channelId);
        }
    }

    @Override
    public EventMessageResult receive(String channelId, String recipientName, ReceiveConfig receiveConfig) {

        PollSource pollSource = receiveConfig.getPollSource() != null ? receiveConfig.getPollSource() : PollSource.AUTO;

        if (pollSource.isCacheEnabled()) {
            EventMessageResult messageEventsFromCache = readMessageEventsFromCache(channelId, recipientName, receiveConfig);
            if (messageEventsFromCache != null && CommonUtils.isNotEmpty(messageEventsFromCache.getEvents())) {
                return messageEventsFromCache;
            }
        }

        List<EventMessage> events = new ArrayList<>();
        long nextGlobalOffset = receiveConfig.getGlobalOffset();
        long nextLocalOffset = receiveConfig.getLocalOffset();
        if (!pollSource.isKafkaEnabled()) {
            return new EventMessageResult(events, nextGlobalOffset, nextLocalOffset);
        }

        ChannelMetadata topicResult = channelTopicProvider.resolveTopic(channelId, ChannelType.DEFAULT);

        String topic = topicResult.getTopicName();
        String key = topicResult.getChannelId();
        KafkaConsumer<String, String> consumer = null;
        try {
            consumer = this.kafkaConsumerPool.acquireConsumer(topic, receiveConfig, 3);
            if (consumer == null) {
                throw new RuntimeException("Failed to acquire a kafka consumer for channelId: " + channelId);
            }

            long startTime = System.currentTimeMillis();
            while (System.currentTimeMillis() - startTime < (pollingTimeout * 1000)) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

                for (ConsumerRecord<String, String> rec : records) {
                    // Checks if the current record belongs to the input channel id and aligned with
                    // Range input
                    if (Objects.equals(rec.key(), key) &&
                            rec.offset() >= receiveConfig.getGlobalOffset() && events.size() < receiveConfig.getLimit()) {
                        try {
                            EventMessage event = mapper.readValue(rec.value(), EventMessage.class);

                            // check from Src/Dest matching
                            if (Utils.matchRecipient(event, recipientName)) {
                                events.add(event);
                            }

                            nextGlobalOffset++;
                            nextLocalOffset++;
                        } catch (Exception ex) {
                            LOGGER.error("[Kafka Receive ERROR] Failed to parse event at offset {}: {}",
                                    rec.offset(), ex.getMessage());
                        }
                    }
                }
                if (!events.isEmpty() || receiveConfig.isPollingDisabled()) break;
            }

            return new EventMessageResult(events, nextGlobalOffset, nextLocalOffset);
        } catch (Exception e) {
            LOGGER.error("[Kafka Receive ERROR] Failed to receive messages for channel {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException("Failed to receive Kafka messages: " + e.getMessage(), e);
        } finally {
            this.kafkaConsumerPool.releaseConsumer(consumer);
        }
    }

    private EventMessageResult readMessageEventsFromCache(String channelId, String recipientName, ReceiveConfig offsetRange) {
        List<EventMessage> events = new ArrayList<>();
        long localOffset = offsetRange.getLocalOffset();
        long globalOffset = offsetRange.getGlobalOffset();
        long limit = offsetRange.getLimit();

        long nextGlobalOffset = globalOffset;
        long nextLocalOffset = localOffset;

        try {
            // iterate from requested localOffset up to localOffset + limit
            for (long currentLocal = localOffset; currentLocal < localOffset + limit; currentLocal++) {
                EventMessage cached = cacheService.getEventMessage(channelId, currentLocal);

                if (cached == null) {
                    // if there's a gap in cache, assume no further cached messages
                    break;
                }

                if (Utils.matchRecipient(cached, recipientName)) {
                    events.add(cached);
                }
                nextGlobalOffset ++;
                nextLocalOffset ++;
            }

            if (events.isEmpty()) return null;

            return new EventMessageResult(events, nextGlobalOffset, nextLocalOffset);
        } catch (Exception e) {
            LOGGER.warn("Failed to read events from cache for channel {}: {}", channelId, e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deleteChannel(String channelId, String devApiKey) {
        try {
            if (CommonUtils.isEmpty(devApiKey)) {
                throw new RuntimeException("Missing API key");
            }

            Developer dev = apiKeyService.findDeveloperByKeyId(devApiKey).orElse(null);
            if (dev == null) {
                throw new RuntimeException("Invalid API key");
            }

            Channel channel = channelService.findByChannelId(channelId).orElse(null);
            if (channel == null) {
                return false;
            }

            // check ownership
            if (channel.getOwner() == null || !channel.getOwner().getId().equals(dev.getId())) {
                throw new RuntimeException("Developer not authorized to reset this channel");
            }

            // reset local offset counter in cache
            try {
                cacheService.removeChannel(channelId);
                cacheService.resetChannelCounter(channelId);
            } catch (Exception e) {
                LOGGER.warn("Failed to reset channel counter in cache for {}: {}", channelId, e.getMessage());
            }

            // determine last offset from kafka and update channel metadata
            Long lastOffset = getLastOffsetForTopic(channelId);

            ChannelMetadata meta = channel.getMetadata();
            if (meta == null) meta = new ChannelMetadata();
            meta.setLocalOffset(0L);
            meta.setGlobalOffset(lastOffset);
            channel.setMetadata(meta);

            channelService.updateChannel(channel);

            LOGGER.info("Reset offsets for channel {}: local=0 global={}", channelId, lastOffset);
            return true;
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            LOGGER.error("[Reset Channel Offsets ERROR] Failed to reset offsets for channel {}: {}", channelId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Return the last offset available for the channel's topic (highest offset). The returned value is the last committed offset
     * (i.e., the end offset - 1) across partitions aggregated by summing partition end offsets as single sequence is not
     * meaningful here; callers expect a per-channel global offset which was tracked by send operation. We approximate by
     * returning the maximum end offset - 1 among partitions for the underlying topic, or 0 when topic empty.
     */
    private Long getLastOffsetForTopic(String channelId) {
        ChannelMetadata topicResult = channelTopicProvider.resolveTopic(channelId, ChannelType.DEFAULT);
        String topic = topicResult.getTopicName();

        KafkaConsumer<String, String> consumer = null;
        try {
            // acquire a consumer starting at offset 0 so we can query endOffsets for partitions
            ReceiveConfig rc = new ReceiveConfig(0L, 0L, 1L);
            consumer = this.kafkaConsumerPool.acquireConsumer(topic, rc, 3);
            if (consumer == null) {
                throw new RuntimeException("Failed to acquire kafka consumer to determine last offset for topic: " + topic);
            }

            List<TopicPartition> partitions = consumer.assignment().isEmpty() ?
                    consumer.partitionsFor(topic).stream().map(p -> new TopicPartition(topic, p.partition())).collect(Collectors.toList())
                    : new ArrayList<>(consumer.assignment());

            return consumer.endOffsets(partitions)
                    .values()
                    .stream()
                    .filter(Objects::nonNull)
                    .filter(val -> val > 0)
                    .mapToLong(val -> val - 1) // end offset is next offset, so last real offset is end-1
                    .max()
                    .orElse(0L);
        } catch (Exception e) {
            LOGGER.error("Failed to get last offset for topic {}: {}", topic, e.getMessage());
            throw new RuntimeException(e.getMessage(), e);
        } finally {
            this.kafkaConsumerPool.releaseConsumer(consumer);
        }
    }

    @Override
    public ChannelOffsetInfo peekChannelOffsets(String channelId) {
        try {
            Long cacheCounter = cacheService.peekChannelCounter(channelId);

            Channel channel = channelService.findByChannelId(channelId).orElse(null);
            Long dbLocal = null;
            Long dbGlobal = null;
            if (channel != null && channel.getMetadata() != null) {
                dbLocal = channel.getMetadata().getLocalOffset();
                dbGlobal = channel.getMetadata().getGlobalOffset();
            }

            Long kafkaLast = null;
            try {
                kafkaLast = getLastOffsetForTopic(channelId);
            } catch (Exception e) {
                LOGGER.warn("Unable to query kafka last offset for {}: {}", channelId, e.getMessage());
            }

            return new ChannelOffsetInfo(channelId, cacheCounter, dbLocal, dbGlobal, kafkaLast);
        } catch (Exception e) {
            LOGGER.error("peekChannelOffsets failed for {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
