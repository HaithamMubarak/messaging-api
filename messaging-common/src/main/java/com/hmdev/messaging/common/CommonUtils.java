package com.hmdev.messaging.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class CommonUtils {
    private CommonUtils() { /* no instances */ }

    private static final Logger logger = LoggerFactory.getLogger(CommonUtils.class);

	public static void sleep(long timeout){
		try {
			Thread.sleep(timeout);
		} catch (InterruptedException e) {
			logger.error("Unexpected error", e);
		}
	}

}