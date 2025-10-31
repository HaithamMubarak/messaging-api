package com.hmdev.messaging.service.exception;

public class InvalidAccessException extends RuntimeException {
    public InvalidAccessException(String message) {
        super(message);
    }

    public InvalidAccessException() {
        super("Invalid access");
    }
}

