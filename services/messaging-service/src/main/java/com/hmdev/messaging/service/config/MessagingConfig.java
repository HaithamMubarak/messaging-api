package com.hmdev.messaging.service.config;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
public class MessagingConfig {

    private final Logger LOGGER = LoggerFactory.getLogger(MessagingConfig.class);

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean(destroyMethod = "close")
    public AdminClient kafkaAdminClient() {
        Properties props = new Properties();
        props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        AdminClient adminClient = AdminClient.create(props);

        try {
            String clusterId = adminClient.describeCluster().clusterId().get();
            LOGGER.info("Cluster Id: {}", clusterId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return adminClient;
    }
}