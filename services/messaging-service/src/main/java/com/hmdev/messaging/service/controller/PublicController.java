package com.hmdev.messaging.service.controller;

import com.hmdev.messaging.service.data.JsonResponse;
import com.hmdev.messaging.service.data.model.Channel;
import com.hmdev.messaging.service.service.ChannelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/messaging-platform/api/v1/messaging-service/public")
public class PublicController {

    private final ChannelService channelService;

    public PublicController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @GetMapping(path = "/channels")
    public JsonResponse getPublicChannels() {
        List<Channel> channels = channelService.findPublicChannels();
        // Map to lightweight DTO with channelId and channelName only
        List<PublicChannelDto> list = channels.stream().map(ch -> new PublicChannelDto(
                ch.getChannelId(), ch.getMetadata() == null ? null : ch.getMetadata().getChannelName()
        )).collect(Collectors.toList());
        return JsonResponse.success(list);
    }

    public static class PublicChannelDto {
        public final String channelId;
        public final String channelName;

        public PublicChannelDto(String channelId, String channelName) {
            this.channelId = channelId;
            this.channelName = channelName;
        }
    }
}
