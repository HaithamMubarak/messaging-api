package com.hmdev.messaging.common;

/**
 * Common API constants used across the messaging platform modules.
 */
public final class ApiConstants {

    private ApiConstants() {}

    /** Header used to send an API key (developer/admin). */
    public static final String HEADER_API_KEY = "X-Api-Key";

    /** Role name fragment indicating administrative privileges on a Developer.roles field. */
    public static final String ROLE_ADMIN = "admin";
}

