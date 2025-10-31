package com.hmdev.messaging.service.repo;

import com.hmdev.messaging.service.data.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    Optional<Channel> findByChannelId(String channelId);

    // count channels by owner id for quota enforcement
    long countByOwnerId(Long ownerId);

    List<Channel> findByOwnerId(Long ownerId);
}
