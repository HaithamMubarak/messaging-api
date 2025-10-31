// filepath: c:\Users\admin\dev\messaging-platform\services\messaging-service\src\main\java\com\hmdev\messaging\service\model\ApiKey.java
package com.hmdev.messaging.service.data.model;

import lombok.Data;

import javax.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_keys")
@Data
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_id", nullable = false, unique = true)
    private UUID keyId;

    @Column(name = "key_hash", nullable = false, columnDefinition = "TEXT")
    private String keyHash;

    private String description;

    private boolean revoked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "developer_id")
    private Developer developer;

    private Instant createdAt = Instant.now();

    private Instant lastUsedAt;

    public ApiKey() {}
}

