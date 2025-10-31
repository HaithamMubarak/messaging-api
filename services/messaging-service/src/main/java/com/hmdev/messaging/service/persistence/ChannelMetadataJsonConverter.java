package com.hmdev.messaging.service.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.data.ChannelMetadata;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = false)
public class ChannelMetadataJsonConverter implements AttributeConverter<ChannelMetadata, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(ChannelMetadata attribute) {
        if (attribute == null) return null;
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize ChannelMetadata", e);
        }
    }

    @Override
    public ChannelMetadata convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) return null;
        try {
            return MAPPER.readValue(dbData, ChannelMetadata.class);
        } catch (Exception e) {
            // If parsing fails, return an empty ChannelMetadata with channelName set to raw dbData
            ChannelMetadata fallback = new ChannelMetadata();
            fallback.setChannelName(dbData);
            return fallback;
        }
    }
}

