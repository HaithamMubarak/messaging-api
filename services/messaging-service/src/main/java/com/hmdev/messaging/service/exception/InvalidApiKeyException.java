package com.hmdev.messaging.service.exception;

public class InvalidApiKeyException extends RuntimeException {
    public InvalidApiKeyException(String message) {
        super(message);
    }

    public InvalidApiKeyException() {
        super("Invalid API Key");
    }
}

