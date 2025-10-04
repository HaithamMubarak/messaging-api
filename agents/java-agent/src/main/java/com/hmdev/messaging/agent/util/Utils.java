package com.hmdev.messaging.agent.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class Utils {
    private Utils() { /* no instances */ }

    private static final Logger logger = LoggerFactory.getLogger(Utils.class);


	public static void sleep(long timeout){
		try {
			Thread.sleep(timeout);
		} catch (InterruptedException e) {
			logger.error("Unexpected error", e);
		}
	}

}