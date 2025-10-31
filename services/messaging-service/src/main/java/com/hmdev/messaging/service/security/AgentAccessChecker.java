package com.hmdev.messaging.service.security;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Utility to check whether an agent is allowed to connect.
 *
 * Located in the messaging-service module.
 */
public final class AgentAccessChecker {

    private AgentAccessChecker() { }

    /**
     * Returns true if the given {@code agentName} matches any entry in {@code allowedAgents}.
     * Entries in {@code allowedAgents} may be:
     * - exact names (case-insensitive)
     * - patterns containing '*' as a wildcard (matches any sequence of characters)
     *
     * The method is null-safe for the input collection and its elements.
     *
     * @param allowedAgents collection of allowed agent names or patterns
     * @param agentName agent name attempting to connect
     * @return true if allowed, false otherwise
     */
    public static boolean isAgentAllowed(Collection<String> allowedAgents, String agentName) {
        if (agentName == null || allowedAgents == null || allowedAgents.isEmpty()) {
            return false;
        }

        String candidate = agentName.trim();
        if (candidate.isEmpty()) {
            return false;
        }

        String candidateLower = candidate.toLowerCase();

        // Collect exact names (without wildcard) for fast membership check
        Set<String> exactSet = allowedAgents.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.contains("*"))
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        if (exactSet.contains(candidateLower)) {
            return true;
        }

        // Check wildcard patterns
        for (String raw : allowedAgents) {
            if (raw == null) continue;
            String pattern = raw.trim();
            if (pattern.isEmpty() || !pattern.contains("*")) continue;

            String regex = toRegex(pattern);
            if (Pattern.compile(regex, Pattern.CASE_INSENSITIVE).matcher(candidate).matches()) {
                return true;
            }
        }

        return false;
    }

    // Convert a simple glob pattern with '*' into a regex string anchored with ^ and $
    private static String toRegex(String glob) {
        // Escape regex meta chars, then replace escaped '*' with ".*"
        String quoted = Pattern.quote(glob);
        return "^" + quoted.replace("\\*", ".*") + "$";
    }
}

