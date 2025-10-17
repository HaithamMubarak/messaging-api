package com.hmdev.messaging.service.kafka;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic tests for Kafka Service Application.
 */
public class KafkaServiceApplicationTest {
    
    @Test
    public void testApplicationExists() {
        // Verify the main class exists and can be instantiated
        assertNotNull(new KafkaServiceApplication());
    }
    
    @Test
    public void testMainMethodDoesNotThrow() {
        // Verify main method can be called without errors
        assertDoesNotThrow(() -> {
            KafkaServiceApplication.main(new String[]{});
        });
    }
}
