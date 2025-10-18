package com.hmdev.messaging.service.kafka.udb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.data.EventMessageRequest;
import com.hmdev.messaging.common.data.MessageReceiveRequest;
import com.hmdev.messaging.service.kafka.controller.MessagingController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * UDP datagram listener that accepts JSON messages and delegates to the
 * existing `MessagingController` methods, reusing the same request DTOs used
 * by the REST endpoints.
 *
 * Expected datagram JSON envelope format (preferred):
 * {
 *   "action": "push" | "pull" | ...,
 *   "payload": { ... DTO fields ... }
 * }
 *
 * Backward compatibility: the legacy field "type" is still accepted but
 * deprecated; log a warning when it is used.
 *
 * The listener will parse the payload into the corresponding DTO class and
 * call the controller method. A short JSON response will be sent back to the
 * UDP sender with structure: { "status": "ok" | "error", "result": ... }
 *
 * Configurable port via property `udp.listener.port` (default: 9999).
 */
@Component
public class UdpDatagramListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(UdpDatagramListener.class);

    private final MessagingController messagingController;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${udp.listener.port:9999}")
    private int port;

    private DatagramSocket socket;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private ExecutorService executor;
    private final AtomicInteger workerCounter = new AtomicInteger(0);

    @Autowired
    public UdpDatagramListener(MessagingController messagingController) {
        this.messagingController = messagingController;
    }

    @PostConstruct
    public void start() {
        try {
            socket = new DatagramSocket(port);
        } catch (Exception e) {
            LOGGER.error("Unable to bind UDP socket on port {}", port, e);
            return;
        }
        running.set(true);
        // Use a cached thread pool so each request is handled on its own worker thread.
        executor = Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "udp-datagram-worker-" + workerCounter.incrementAndGet());
            t.setDaemon(true);
            return t;
        });
        executor.submit(this::listenLoop);
        LOGGER.info("UDP listener started on port {}", port);
    }

    @PreDestroy
    public void stop() {
        running.set(false);
        if (socket != null && !socket.isClosed()) {
            socket.close();
        }
        if (executor != null) {
            executor.shutdownNow();
        }
        LOGGER.info("UDP listener stopped");
    }

    private void listenLoop() {
        byte[] buffer = new byte[64 * 1024]; // 64KB
        while (running.get() && socket != null && !socket.isClosed()) {
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            try {
                socket.receive(packet);
                final InetAddress sender = packet.getAddress();
                final int senderPort = packet.getPort();
                final int length = packet.getLength();
                final String payload = new String(packet.getData(), 0, length, StandardCharsets.UTF_8);
                LOGGER.debug("Received UDP datagram from {}:{} -> {}", sender, senderPort, payload);

                // Submit each packet handling to the cached pool so it runs on a
                // dedicated worker thread concurrently with others.
                executor.submit(() -> handleMessage(payload, sender, senderPort));

            } catch (IOException e) {
                if (running.get()) {
                    LOGGER.error("Error receiving UDP packet", e);
                }
            }
        }
    }

    private void handleMessage(String rawJson, InetAddress sender, int senderPort) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            if (root == null) {
                sendError(sender, senderPort, "invalid json");
                return;
            }

            // Prefer "action" but fall back to legacy "type" for compatibility
            String action = null;
            if (root.has("action") && !root.get("action").isNull()) {
                action = root.get("action").asText();
            } else if (root.has("type") && !root.get("type").isNull()) {
                action = root.get("type").asText();
                LOGGER.warn("UDP message uses deprecated field 'type'; prefer 'action'");
            } else {
                sendError(sender, senderPort, "missing action/type field");
                return;
            }

            String actionLower = action.toLowerCase(Locale.ROOT);
            JsonNode payloadNode = root.get("payload");

            if (payloadNode == null || payloadNode.isNull()) {
                sendError(sender, senderPort, "missing payload");
                return;
            }

            Object result;
            switch (actionLower) {
                case "push": {
                    EventMessageRequest req = objectMapper.treeToValue(payloadNode, EventMessageRequest.class);
                    result = messagingController.sendEvent(req);
                    break;
                }
                case "pull": {
                    MessageReceiveRequest req = objectMapper.treeToValue(payloadNode, MessageReceiveRequest.class);
                    result = messagingController.receive(req);
                    break;
                }
                default:
                    sendError(sender, senderPort, "unknown action: " + action);
                    return;
            }

            sendOk(sender, senderPort, result);

        } catch (Exception e) {
            LOGGER.error("Error handling UDP message", e);
            try {
                sendError(sender, senderPort, e.getMessage());
            } catch (Exception ex) {
                LOGGER.error("Error sending error response to UDP sender", ex);
            }
        }
    }

    private void sendOk(InetAddress addr, int port, Object result) throws IOException {
        JsonNode node = objectMapper.valueToTree(result);
        String resp = objectMapper.writeValueAsString(objectMapper.createObjectNode().put("status", "ok").set("result", node));
        send(resp, addr, port);
    }

    private void sendError(InetAddress addr, int port, String message) throws IOException {
        String resp = objectMapper.writeValueAsString(objectMapper.createObjectNode().put("status", "error").put("message", message));
        send(resp, addr, port);
    }

    private void send(String message, InetAddress addr, int port) throws IOException {
        if (addr == null) {
            return;
        }
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        DatagramPacket packet = new DatagramPacket(bytes, bytes.length, addr, port);
        socket.send(packet);
    }
}
