package com.hmdev.messaging.service.exception;

public class ChannelLimitExceededException extends RuntimeException {
    public ChannelLimitExceededException(String message) {
        super(message);
    }
}

