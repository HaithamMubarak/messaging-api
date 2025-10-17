package com.hmdev.messaging.service.kafka.config;

/**
 * Configuration for Kafka connections and topics.
 * 
 * This class will manage:
 * - Kafka broker connection settings
 * - Topic configurations for channels
 * - Producer and Consumer properties
 */
public class KafkaConfig {
    
    private String bootstrapServers = "localhost:9092";
    private String groupId = "messaging-api-service";
    
    public String getBootstrapServers() {
        return bootstrapServers;
    }
    
    public void setBootstrapServers(String bootstrapServers) {
        this.bootstrapServers = bootstrapServers;
    }
    
    public String getGroupId() {
        return groupId;
    }
    
    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }
}
