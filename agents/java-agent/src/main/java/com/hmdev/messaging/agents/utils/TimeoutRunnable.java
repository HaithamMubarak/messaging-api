package com.hmdev.messaging.agents.utils;

/**
 * 
 * @author Haitham Mubarak
 *
 */
public class TimeoutRunnable implements Runnable{

	private Runnable runnable;
	private long timeout;
	
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
			e.printStackTrace();
		}
		if(runnable != null){
			runnable.run();
		}
		
	}
	
}