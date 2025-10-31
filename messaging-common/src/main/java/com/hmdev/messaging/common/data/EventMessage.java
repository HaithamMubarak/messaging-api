package com.hmdev.messaging.common.data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class EventMessage {

    private String from;
    private String to;
    private EventType type;
    private boolean encrypted;
    private String content;
    private long date;

    private Map<String, String> otherProperties;

    public EventMessage(String from, String to, EventType type, boolean encrypted, String content, long date) {
        this.from = from;
        this.to = to;
        this.type = type;
        this.encrypted = encrypted;
        this.content = content;
        this.date = date;
        this.otherProperties = new HashMap<>();
    }

    public EventMessage(EventMessage other) {
        this.from = other.from;
        this.to = other.to;
        this.type = other.type;
        this.encrypted = other.encrypted;
        this.content = other.content;
        this.date = other.date;
        // Make a defensive copy of the map (if non-null)
        this.otherProperties = other.otherProperties != null
                ? new HashMap<>(other.otherProperties)
                : new HashMap<>();
    }

    public Map<String, String> getOtherProperties() {
        if (otherProperties == null) {
            otherProperties = new HashMap<>();
        }
        return otherProperties;
    }

    public enum EventType {
        CHAT_TEXT, CONNECT, DISCONNECT, UDP_DATA,
        /**
         * Sent by a new agent to request the channel password (payload: the agent's public key or key envelope).
         *
         * IMPORTANT: This event type is an agent-domain message; the Messaging-Service core must treat it
         * as an opaque EventMessage. The server must not persist, inspect, or process password request
         * contents in any special way. Handling (encryption/decryption and password storage) is the
         * responsibility of agents or developer-owned domain-servers.
         */
        PASSWORD_REQUEST,
        /**
         * Sent by the initiator (or any holder of the secret) as a private reply addressed to 'to' with encrypted content.
         *
         * IMPORTANT: This is an agent-domain reply. The Messaging-Service core must not attempt to decrypt,
         * persist, or otherwise special-case these messages.
         */
        PASSWORD_REPLY;

        @JsonValue
        public String toJson() {
            return this.toString().toLowerCase().replace('_', '-');
        }

        @JsonCreator
        public static EventType fromJson(String value) {
            return EventType.valueOf(value.toUpperCase().replace('-', '_'));
        }
    }

}
