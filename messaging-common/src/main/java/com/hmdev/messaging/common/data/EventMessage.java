package com.hmdev.messaging.common.data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

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

    @lombok.Builder.Default
    private Map<String, String> otherProperties = Map.of();

    public EventMessage(String from, String to, EventType type, boolean encrypted, String content, long date) {
        this.from = from;
        this.to = to;
        this.type = type;
        this.encrypted = encrypted;
        this.content = content;
        this.date = date;
        this.otherProperties = Map.of(); // default
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
                ? Map.copyOf(other.otherProperties)
                : Map.of();
    }

    public enum EventType {
        CHAT_TEXT, CONNECT, DISCONNECT;

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
