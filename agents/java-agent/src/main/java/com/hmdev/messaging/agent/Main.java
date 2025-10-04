package com.hmdev.messaging.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.hmdev.messaging.agent.core.AgentConnection;
import com.hmdev.messaging.agent.data.AgentRecord;
import com.hmdev.messaging.agent.data.MessageEvent;
import com.hmdev.messaging.agent.util.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static final String EXIT_COMMAND = "/java-agent:exit";

    private static final ObjectMapper mapper = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    public static void main(String[] args) throws Exception {

        // Default values
        String apiUrl = "https://hmdevonline.com/messaging-api/origin-service";
        String channel = "system001";
        String password = "12345678";
        String agentName = "java-agent001";

        // Simple argument parser (--key=value style)
        for (String arg : args) {
            if (arg.startsWith("--url=")) {
                apiUrl = arg.substring("--url=".length());
            } else if (arg.startsWith("--channel=")) {
                channel = arg.substring("--channel=".length());
            } else if (arg.startsWith("--password=")) {
                password = arg.substring("--password=".length());
            } else if (arg.startsWith("--agent-name=")) {
                agentName = arg.substring("--agentName=".length());
            }
        }

        CountDownLatch latch = new CountDownLatch(1);
        AgentConnection agentConnection = new AgentConnection(apiUrl, agentName);

        try {
            agentConnection.connect(channel, password);

            List<AgentRecord> agentsResults = agentConnection.getActiveAgents();
            logger.info("agentsResults: {}", agentsResults);

            boolean sendMessageResult = agentConnection.sendMessage("Hello, I am " + agentName);
            logger.info("sendMessageResult: {}", sendMessageResult);

            agentConnection.receiveAsync(messageEvents -> {

                try {
                    logger.info("New Message events:");
                    for (MessageEvent messageEvent : messageEvents) {
                        logger.info("MessageEvent: {}", mapper.writeValueAsString(messageEvent));
                    }

                    // sample code to handle special prompts
                    if (messageEvents.stream()
                            .filter(event -> event.getDate() > agentConnection.getConnectionTime())
                            .map(MessageEvent::getContent).filter(Objects::nonNull).map(String::trim).anyMatch(EXIT_COMMAND::equals)) {
                        agentConnection.sendMessage("Bye bye from your Java Agent - have a great day! :)");
                        Utils.sleep(2000);
                        latch.countDown();
                    }
                } catch (Exception e) {
                    logger.warn("Exception {} caught for {}", e.getLocalizedMessage(), messageEvents);
                }
            });

            latch.await(10, TimeUnit.MINUTES);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage());
        } finally {
            agentConnection.disconnect();
        }
    }

}