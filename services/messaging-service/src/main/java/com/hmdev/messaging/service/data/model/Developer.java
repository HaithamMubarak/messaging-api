package com.hmdev.messaging.service.data.model;

import lombok.Data;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "developers")
@Data
public class Developer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String company;

    private String roles;

    private boolean active = true;

    @Column(name = "channel_limit", nullable = false)
    private Integer channelLimit = 50; // default per-developer channel limit

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Channel> channels = new ArrayList<>();

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public Developer() {
    }

    public boolean isAdmin() {
        return this.getRoles() != null && this.getRoles().toLowerCase().contains(com.hmdev.messaging.common.ApiConstants.ROLE_ADMIN);
    }
}
