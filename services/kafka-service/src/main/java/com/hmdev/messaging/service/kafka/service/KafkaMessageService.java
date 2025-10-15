package com.hmdev.messaging.service.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.data.EventMessageResult;
import com.hmdev.messaging.common.data.Pair;
import com.hmdev.messaging.common.data.OffsetRange;
import com.hmdev.messaging.common.service.EventMessageService;
import com.hmdev.messaging.service.kafka.service.provider.ChannelType;
import com.hmdev.messaging.service.kafka.service.provider.IChannelTopicProvider;
import org.apache.kafka.clients.consumer.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;


@Service
public class KafkaMessageService implements EventMessageService {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaMessageService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final KafkaConsumerPool kafkaConsumerPool;
    private final IChannelTopicProvider channelTopicProvider;

    @Value("${messaging.pollingTimeout:35}")
    private long pollingTimeout;

    public KafkaMessageService(KafkaTemplate<String, String> kafkaTemplate, IChannelTopicProvider channelTopicProvider,
                               KafkaConsumerPool kafkaConsumerPool) {
        this.kafkaTemplate = kafkaTemplate;
        this.channelTopicProvider = channelTopicProvider;
        this.kafkaConsumerPool = kafkaConsumerPool;
    }

    @Override
    public void send(String channelId, EventMessage event) {
        try {
            Pair<String, String> topicResult = channelTopicProvider.resolveTopic(channelId, ChannelType.DEFAULT);
            String topic = topicResult.getFirst();
            String key = topicResult.getSecond();

            String payload = mapper.writeValueAsString(event);

            SendResult<String, String> result = kafkaTemplate.send(topic, key, payload).get(10, TimeUnit.SECONDS);

            if (result != null && result.getRecordMetadata() != null) {
                LOGGER.debug(
                        "[Kafka Send] Channel={} | Topic={} | Partition={} | Offset={} | Key={}",
                        channelId,
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        key
                );
            }
        } catch (Exception e) {
            LOGGER.error("[Kafka Send ERROR] Failed to send message to channel {}: {}", channelId, e.getMessage(), e);
            throw new RuntimeException("Failed to send Kafka message: " + e.getMessage(), e);
        }
    }

    @Override
    public EventMessageResult receive(String channelId, String recipientName, OffsetRange offsetRange) {

        Pair<String, String> topicResult = channelTopicProvider.resolveTopic(channelId, ChannelType.DEFAULT);
        String topic = topicResult.getFirst();
        String key = topicResult.getSecond();

        KafkaConsumer<String, String> consumer = null;
        try {
            consumer = this.kafkaConsumerPool.acquireConsumer(topic, offsetRange, 3);
            if (consumer == null)
            {
               throw new RuntimeException("Failed to acquire a kafka consumer for channelId: " + channelId);
            }

            List<EventMessage> events = new ArrayList<>();
            long nextOffset = offsetRange.getStartOffset();

            long startTime = System.currentTimeMillis();
            while (System.currentTimeMillis() - startTime < (pollingTimeout * 1000)) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

                for (ConsumerRecord<String, String> rec : records) {
                    // Checks if the current record belongs to the input channel id and aligned with
                    // Range input
                    if (Objects.equals(rec.key(), key) &&
                            rec.offset() >= offsetRange.getStartOffset() && events.size() < offsetRange.getLimit()) {
                        try {
                            EventMessage event = mapper.readValue(rec.value(), EventMessage.class);

                            // check from Src/Dest matching
                            if (matchRecipient(event, recipientName)) {
                                events.add(event);
                            }

                            nextOffset = rec.offset() + 1;
                        } catch (Exception ex) {
                            LOGGER.error("[Kafka Receive ERROR] Failed to parse event at offset {}: {}",
                                    rec.offset(), ex.getMessage());
                        }
                    }
                }
                if (!events.isEmpty()) break;
            }

            return new EventMessageResult(events, nextOffset);
        } catch (Exception exception) {
            LOGGER.error("[Kafka Receive ERROR] Failed to read messages for channel {}: {}", channelId,
                    exception.getMessage(), exception);
            throw new RuntimeException("Kafka receive error: " + exception.getMessage(), exception);
        } finally {
            if (consumer != null) {
                this.kafkaConsumerPool.releaseConsumer(consumer);
            }
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
