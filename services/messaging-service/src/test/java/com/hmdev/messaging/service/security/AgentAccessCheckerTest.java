package com.hmdev.messaging.service.security;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AgentAccessCheckerTest {

    @Test
    public void exactMatchAllowed() {
        assertTrue(AgentAccessChecker.isAgentAllowed(List.of("Alice"), "Alice"));
        assertTrue(AgentAccessChecker.isAgentAllowed(List.of("Alice"), "alice")); // case-insensitive
    }

    @Test
    public void wildcardMatchAllowed() {
        assertTrue(AgentAccessChecker.isAgentAllowed(List.of("dev-*"), "dev-123"));
        assertTrue(AgentAccessChecker.isAgentAllowed(List.of("*"), "anything"));
        assertTrue(AgentAccessChecker.isAgentAllowed(List.of("foo*bar"), "foobazbar"));
    }

    @Test
    public void notAllowedWhenNoMatch() {
        assertFalse(AgentAccessChecker.isAgentAllowed(List.of("Bob"), "Alice"));
        assertFalse(AgentAccessChecker.isAgentAllowed(List.of("dev-*"), "prod-1"));
    }

    @Test
    public void handlesNullAndEmptyInputs() {
        assertFalse(AgentAccessChecker.isAgentAllowed(null, "Alice"));
        assertFalse(AgentAccessChecker.isAgentAllowed(List.of(), "Alice"));
        assertFalse(AgentAccessChecker.isAgentAllowed(List.of(""), "Alice"));
        assertFalse(AgentAccessChecker.isAgentAllowed(List.of("Alice"), null));
        assertFalse(AgentAccessChecker.isAgentAllowed(List.of("Alice"), ""));
    }
}

