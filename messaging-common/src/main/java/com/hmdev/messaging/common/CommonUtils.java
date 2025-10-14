package com.hmdev.messaging.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

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

    public static boolean isEmpty(Object object) {
        if (object instanceof String) {
            return object.toString().isEmpty();
        }
        if (object instanceof List) {
            return ((List<?>)object).isEmpty();
        }
        return object == null;
    }
}