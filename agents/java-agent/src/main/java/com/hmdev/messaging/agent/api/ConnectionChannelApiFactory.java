package com.hmdev.messaging.agent.api;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hmdev.messaging.agent.api.impl.MessagingChannelApi;



public abstract class ConnectionChannelApiFactory {
    private static final Logger logger = LoggerFactory.getLogger(ConnectionChannelApiFactory.class);

	private ConnectionChannelApiFactory(){
		super();
	}
	
	/**
	 * Create a ConnectionChannelApi for the given descriptor. The optional developerApiKey
	 * will be applied to the created API instance (X-Api-Key header) if provided.
	 */
	public static ConnectionChannelApi getConnectionApi(String descriptor) {
		return getConnectionApi(descriptor, null);
	}

	public static ConnectionChannelApi getConnectionApi(String descriptor, String developerApiKey) {
		if(descriptor.matches("^https?://.*")){
			return new MessagingChannelApi(descriptor, developerApiKey);
		}else{
			throw new RuntimeException("Connection channel descriptor is not supported");
		}
	}
}