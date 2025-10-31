package com.hmdev.messaging.service.utils;

import com.hmdev.messaging.common.CommonUtils;
import com.hmdev.messaging.common.data.EventMessage;
import com.hmdev.messaging.common.security.MySecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Utils {
    private static final int REGEX_LIMIT = 256;
    private static final Logger LOGGER = LoggerFactory.getLogger(Utils.class);

    private Utils() {
    }

    public static String createChannelId(String name, String password, String devApiKey) {
        return MySecurity.deriveChannelSecret(devApiKey + ":" + name, password);
    }

    public static boolean matchRecipient(EventMessage event, String recipientName) {

        String from = event.getFrom();
        String to = event.getTo();

        // If message has no 'from' we can't match; otherwise allow messages from the sender
        // to be delivered back to the sender (so clients receive their own sent messages).
        if (from == null) return false;

        if (CommonUtils.isEmpty(to)) return true;

        // Private Message mode
        if (recipientName.equals(to)) return true;

        // Optional wildcard support only
        if (to.contains("*")) {
            return wildcardMatch(to, recipientName);
        }

        return false;
    }

    private static boolean wildcardMatch(String pattern, String target) {
        if (pattern == null) return false;
        if (pattern.length() > REGEX_LIMIT) return false;

        String regex = "^" + pattern.replace("*", ".*") + "$";
        try {
            return target.matches(regex);
        } catch (Exception e) {
            LOGGER.warn("Invalid recipient pattern: {}", pattern);
            return false;
        }
    }
}
