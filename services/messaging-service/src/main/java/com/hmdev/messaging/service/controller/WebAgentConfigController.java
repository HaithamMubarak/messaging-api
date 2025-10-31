package com.hmdev.messaging.service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/messaging-platform/generated/web-agent")
public class WebAgentConfigController {

    @Value("${messaging.init.admin.keyId:${DEFAULT_API_KEY:c9b1c8f2-3a5b-4f2a-8d2b-1234567890ab}}")
    private String adminKeyId;

    @GetMapping(value = "/default-key.js", produces = "application/javascript")
    public String defaultKeyJs() {
        String safe = adminKeyId.trim().replace("'", "\\'");
        return "window.__DEFAULT_API_KEY = '" + safe + "';\n";
    }
}

