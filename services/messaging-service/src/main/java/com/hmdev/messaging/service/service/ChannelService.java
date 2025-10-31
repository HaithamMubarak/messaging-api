// filepath: c:\Users\admin\dev\messaging-platform\services\messaging-service\src\main\java\com\hmdev\messaging\service\service\ChannelService.java
package com.hmdev.messaging.service.service;

import com.hmdev.messaging.common.data.ChannelMetadata;
import com.hmdev.messaging.service.exception.ChannelLimitExceededException;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.data.model.Developer;
import com.hmdev.messaging.service.repo.ChannelRepository;
import com.hmdev.messaging.service.repo.DeveloperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChannelService {
    private final ChannelRepository channelRepository;
    private final DeveloperRepository developerRepository;


    public ChannelService(ChannelRepository channelRepository, DeveloperRepository developerRepository) {
        this.channelRepository = channelRepository;
        this.developerRepository = developerRepository;
    }

    @Transactional
    public Channel createChannel(Developer dev, ChannelMetadata channelMetadata) {

        String channelId = channelMetadata.getChannelId();
        Optional<Channel> channelOptional = this.findByChannelId(channelId);
        if (channelOptional.isPresent()) {
            return channelOptional.get();
        }

        long current = channelRepository.countByOwnerId(dev.getId());
        int limit = dev.getChannelLimit() == null ? 50 : dev.getChannelLimit();
        if (current >= limit) {
            throw new ChannelLimitExceededException("Developer " + dev.getEmail() + " reached channel limit: " + limit);
        }

        Channel channel = new Channel();
        channel.setChannelId(channelId);
        channel.setOwner(dev);
        channel.setMetadata(channelMetadata);
        channel.setEventCount(0L);
        channel.setCreatedAt(Instant.now());

        return channelRepository.save(channel);
    }

    public Optional<Channel> findByChannelId(String channelId) {
        return channelRepository.findByChannelId(channelId);
    }

    @Transactional
    public Optional<Channel> deleteChannel(String channelId) {
        Optional<Channel> chOpt = findByChannelId(channelId);
        if (chOpt.isPresent()) {
            channelRepository.delete(chOpt.get());
            return chOpt;
        }
        return Optional.empty();
    }

    @Transactional
    public Channel updateChannel(Channel channel) {
        return channelRepository.save(channel);
    }

    // New: list channels for a developer using repository method to avoid lazy-loading issues
    public List<Channel> findChannelsByDeveloperId(Long developerId) {
        return channelRepository.findByOwnerId(developerId);
    }

    // New: return public channels (channels where metadata.publicChannel == true)
    public List<Channel> findPublicChannels() {
        return channelRepository.findAll().stream()
                .filter(ch -> ch.getMetadata() != null && ch.getMetadata().isPublicChannel())
                .collect(Collectors.toList());
    }
}
