package com.hmdev.messaging.agent.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * 
 * @author Haitham Mubarak
 *
 */
public final class TimeoutRunnable implements Runnable{
    private static final Logger logger = LoggerFactory.getLogger(TimeoutRunnable.class);

	private final Runnable runnable;
	private final long timeout;
	
	private TimeoutRunnable(long timeout,Runnable runnable){
		this.runnable = runnable;
		this.timeout = timeout;
	}
	
	public static void setTimeout(long timeout,Runnable runnable){
		TimeoutRunnable thread = new TimeoutRunnable(timeout, runnable);
		new Thread(thread).start();
	}
	
    @Override
	public void run() {
		try {
			Thread.sleep(this.timeout);
		} catch (InterruptedException e) {
			logger.error("Unexpected error", e);
		}
		if(runnable != null){
			runnable.run();
		}
		
	}
	
}