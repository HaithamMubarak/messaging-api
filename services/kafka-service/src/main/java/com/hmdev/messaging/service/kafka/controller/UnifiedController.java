package com.hmdev.messaging.service.kafka.controller;

import com.hmdev.messaging.service.kafka.model.JsonResponse;
import com.hmdev.messaging.service.kafka.service.ChannelPathService;
import com.hmdev.messaging.service.kafka.service.FileLockUtil;
import com.hmdev.messaging.service.kafka.service.KafkaMessageService;
import com.hmdev.messaging.service.kafka.service.MessageStore;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UnifiedController {

    @Autowired
    private KafkaMessageService kafkaMessageService;

    private final MessageStore store = new MessageStore();
    private final ObjectMapper om = new ObjectMapper();

    @PostMapping(path = "/index", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Object index(@RequestParam String action, @RequestBody(required = false) Map<String,Object> data) throws IOException {
        if (data == null) data = new LinkedHashMap<>();

        try {
            switch (action) {
                case "agent-info": {
                    String channelName = str(data.get("channelName"));
                    String channelPassword = str(data.get("channelPassword"));

                }
                case "active-agents": {
                    String channelName = str(data.get("channelName"));
                    String channelPassword = str(data.get("channelPassword"));

                }
                case "connect": {
                    String channelName = str(data.get("channelName"));
                    String channelPassword = str(data.get("channelPassword"));
                    String agentName = str(data.get("agentName"));
                    String agentContext = str(data.get("agentContext"));
                    String role = strOrDefault(data.get("role"), "client");

                    String channelId = "";//(channelName, channelPassword);
                    String sessionId = java.util.UUID.randomUUID().toString();

                    var payload = new LinkedHashMap<String,Object>();
                    payload.put("channelId", channelId);
                    payload.put("sessionId", sessionId);
                    payload.put("role", role);
                    payload.put("date", System.currentTimeMillis());
                    return JsonResponse.ok(om.writeValueAsString(payload));
                }
                case "event": {
                    String channelName = str(data.get("channelName"));
                    String channelPassword = str(data.get("channelPassword"));

                    return JsonResponse.ok(null);
                }
                case "receive": {
                    String sessionId = str(data.get("sessionId"));
                    String range = String.valueOf(data.getOrDefault("range","0-"));
                    String currentAgent = str(data.get("agentName")); // required to filter

                    // lock per session like PHP
                    Path sessionLockPath = paths.channelSessionsLocksPath(channelId, sessionId);
                    var resp = store.receive(channelId, sessionId, currentAgent, range, true);
                    return JsonResponse.ok(om.writeValueAsString(resp));
                }
                case "disconnect": {
                    String channelName = str(data.get("channelName"));
                    String channelPassword = str(data.get("channelPassword"));
                    String channelId = paths.getChannelId(channelName, channelPassword);
                    String sessionId = str(data.get("sessionId"));

                    // dispatch disconnect
                    var ev = new LinkedHashMap<String,Object>();
                    ev.put("type","disconnect");
                    store.dispatch(channelId, ev);

                    // write a :close marker to this session socket
                    java.nio.file.Files.writeString(paths.channelSessionsSocketsPath(channelId, sessionId), ":close",
                        java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);

                    return JsonResponse.ok(null);
                }
                default:
                    return JsonResponse.error("Unknown action: " + action);
            }
        } catch (Exception e) {
            return JsonResponse.error(e.getMessage() == null ? e.toString() : e.getMessage());
        }
    }

    private static String str(Object o) { return o == null ? null : String.valueOf(o); }
    private static String strOrDefault(Object o, String d) { return o == null ? d : String.valueOf(o); }
}
