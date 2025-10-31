// filepath: c:\Users\admin\dev\messaging-platform\services\messaging-service\src\main\java\com\hmdev\messaging\service\model\Channel.java
package com.hmdev.messaging.service.data.model;

import com.hmdev.messaging.common.data.ChannelMetadata;
import com.hmdev.messaging.service.persistence.ChannelMetadataJsonConverter;
import lombok.Data;

import javax.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "channels")
@Data
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false, unique = true)
    private String channelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Developer owner;

    // Store metadata as JSON text using AttributeConverter
    @Convert(converter = ChannelMetadataJsonConverter.class)
    @Column(columnDefinition = "text")
    private ChannelMetadata metadata;

    private Long eventCount = 0L;

    private Instant createdAt = Instant.now();

    public Channel() {}
}
