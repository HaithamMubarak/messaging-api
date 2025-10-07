package com.hmdev.messaging.service.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;

public class MessageStore {
    private final ChannelPathService paths = new ChannelPathService();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Path eventsCounter(String channelId) throws IOException {
        return paths.channelParentPath(channelId).resolve("events.counter");
    }

    private synchronized long nextIndex(String channelId) throws IOException {
        Path cf = eventsCounter(channelId);
        long cur = 0;
        if (Files.exists(cf)) {
            String s = Files.readString(cf).trim();
            if (!s.isEmpty()) try {
                cur = Long.parseLong(s);
            } catch (Exception ignore) {
            }
        }
        long next = cur + 1;
        Files.writeString(cf, Long.toString(next), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        return next;
    }

    private long currentMax(String channelId) throws IOException {
        Path cf = eventsCounter(channelId);
        if (!Files.exists(cf)) return 0;
        String s = Files.readString(cf).trim();
        if (s.isEmpty()) return 0;
        try {
            return Long.parseLong(s);
        } catch (Exception e) {
            return 0;
        }
    }

    public void writeAgentInfo(String channelId, String agentName, Map<String, Object> info) throws IOException {
        Path f = paths.channelAgentsPath(channelId, agentName);
        String json = objectMapper.writeValueAsString(info);
        Files.writeString(f, json, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    public Map<String, Object> readAgentInfo(String channelId, String agentName) throws IOException {
        Path f = paths.channelAgentsPath(channelId, agentName);
        if (!Files.exists(f)) return Map.of();
        String json = Files.readString(f);
        return objectMapper.readValue(json, Map.class);
    }

    public List<Map<String, Object>> listActiveAgents(String channelId) throws IOException {
        Path dir = paths.channelAgentsPath(channelId, null);
        if (!Files.exists(dir)) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir)) {
            for (Path p : ds) {
                if (Files.isDirectory(p)) continue;
                String json = Files.readString(p);
                try {
                    out.add(objectMapper.readValue(json, Map.class));
                } catch (Exception ignored) {
                }
            }
        }
        return out;
    }

    public void dispatch(String channelId, Map<String, Object> event) throws IOException {
        if (!event.containsKey("date")) event.put("date", System.currentTimeMillis());
        long idx = nextIndex(channelId);
        Path f = paths.channelEventsPath(channelId, idx + ".json");
        String json = objectMapper.writeValueAsString(event);
        Files.writeString(f, json, StandardOpenOption.CREATE_NEW);
        signalBroadcast(channelId, ":event");
    }

    // --- Socket signal emulation ---
    private void signalBroadcast(String channelId, String marker) throws IOException {
        Path bcast = paths.channelSessionsSocketsPath(channelId, "_broadcast");
        Files.createDirectories(bcast.getParent());
        Files.writeString(bcast, marker, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    public static class PendingClosedException extends RuntimeException {
        public PendingClosedException() {
            super("closed");
        }
    }

    public Map<String, Object> receive(String channelId, String sessionId, String currentAgent, String range, boolean longPollEnable) throws IOException {
        if (range == null) range = "0-";
        if (!range.contains("-")) range = range + "-";
        int dash = range.lastIndexOf('-');
        long start = 0, end = Long.MAX_VALUE;
        try {
            start = Long.parseLong(range.substring(0, dash));
        } catch (Exception ignore) {
        }
        String tail = range.substring(dash + 1);
        if (!tail.isEmpty()) try {
            end = Long.parseLong(tail);
        } catch (Exception ignore) {
        }

        read_counter:
        while (true) {
            long eventMax = currentMax(channelId);
            long maxDataLength = (end - start + 1);
            if (maxDataLength < 0) maxDataLength = Long.MAX_VALUE;

            List<Map<String, Object>> events = new ArrayList<>();
            long updateLength = 0;

            for (long i = start; i <= eventMax && events.size() < maxDataLength; i++) {
                Path f = paths.channelEventsPath(channelId, i + ".json");
                if (!Files.exists(f)) {
                    updateLength++;
                    continue;
                }
                String content = Files.readString(f);
                Map<String, Object> ev = objectMapper.readValue(content, Map.class);
                String from = String.valueOf(ev.getOrDefault("from", ""));
                String to = String.valueOf(ev.getOrDefault("to", ".*"));
                if (!from.equals(currentAgent) && Pattern.compile(to).matcher(currentAgent).find()) {
                    ev.remove("session");
                    ev.remove("to");
                    events.add(ev);
                }
                updateLength++;
            }

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("updateLength", updateLength);

            if (events.isEmpty() && longPollEnable) {
                // emulate MessageConnector::receive()
                Path sock = paths.channelSessionsSocketsPath(channelId, sessionId);
                long startWait = System.currentTimeMillis();
                String msg;
                for (; ; ) {
                    if (Files.exists(sock)) {
                        String s = Files.readString(sock).trim();
                        if (!s.isEmpty()) {
                            msg = s;
                            break;
                        }
                    }
                    Path bcast = paths.channelSessionsSocketsPath(channelId, "_broadcast");
                    if (Files.exists(bcast)) {
                        String s = Files.readString(bcast).trim();
                        if (!s.isEmpty()) {
                            msg = s;
                            break;
                        }
                    }
                    if (System.currentTimeMillis() - startWait > 25000) {
                        msg = ":no-client";
                        break;
                    }
                    try {
                        Thread.sleep(150);
                    } catch (InterruptedException ignored) {
                    }
                }

                if (":no-client".equals(msg)) {
                    // build connected-agent events
                    for (Map<String, Object> ag : listActiveAgents(channelId)) {
                        Map<String, Object> obj = new LinkedHashMap<>();
                        obj.put("type", "connected-agent");
                        obj.put("agent", ag);
                        obj.put("to", ".*");
                        events.add(obj);
                    }
                } else if (":event".equals(msg)) {
                    continue read_counter; // re-scan after event
                } else if (":close".equals(msg)) {
                    throw new PendingClosedException();
                }
            }

            resp.put("events", events);
            resp.put("date", System.currentTimeMillis());
            return resp;
        }
    }
}
