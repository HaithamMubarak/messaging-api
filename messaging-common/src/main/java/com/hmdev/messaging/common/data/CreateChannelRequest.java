package com.hmdev.messaging.common.data;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChannelRequest {
    private String channelName;
    private String channelPassword;
}