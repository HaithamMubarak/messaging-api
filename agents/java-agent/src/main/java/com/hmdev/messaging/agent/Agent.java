package com.hmdev.messaging.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.hmdev.messaging.agent.core.AgentConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Agent service main. TCP/UDP server support has been removed.
 * Use the library API (AgentConnection) directly in your application instead.
 *
 * Args:
 *  --url=<baseUrl>          Messaging API base URL (default https://hmdevonline.com/messaging-platform/api/v1/messaging-service)
 *  --api-key=<key>          Optional API key for authentication
 */
public class Agent {
    private static final Logger logger = LoggerFactory.getLogger(Agent.class);

    private static final ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

    public static void main(String[] args) {
        String apiUrl = "https://hmdevonline.com/messaging-platform/api/v1/messaging-service";
        String apiKey = null;

        for (String arg : args) {
            if (arg.startsWith("--url=")) {
                apiUrl = arg.substring("--url=".length());
            } else if (arg.startsWith("--api-key=")) {
                apiKey = arg.substring("--api-key=".length());
            }
        }

        logger.info("TCP/UDP server functionality has been removed from Agent service.");
        logger.info("Please use AgentConnection API directly in your application code.");
        logger.info("See examples in agents/examples/java-agent-chat for usage patterns.");
        logger.info("API URL configured: {}", apiUrl);
        
        // Example placeholder - in practice, applications should use AgentConnection directly
        AgentConnection agentConnection = (apiKey == null || apiKey.isBlank()) 
            ? new AgentConnection(apiUrl) 
            : new AgentConnection(apiUrl, apiKey);
        
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            agentConnection.disconnect();
            logger.info("Agent service stopped.");
        }));
        
        logger.info("Agent entrypoint is now a library. Exiting...");
    }
}
