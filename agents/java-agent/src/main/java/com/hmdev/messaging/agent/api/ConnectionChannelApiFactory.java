package com.hmdev.messaging.agent.api;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hmdev.messaging.agent.api.http.HTTPChannelApi;



public abstract class ConnectionChannelApiFactory {
    private static final Logger logger = LoggerFactory.getLogger(ConnectionChannelApiFactory.class);

	
	private ConnectionChannelApiFactory(){
		super();
	}
	
	public static ConnectionChannelApi getConnectionApi(String descriptor) {
		if(descriptor.matches("^https?://.*")){
			return new HTTPChannelApi(descriptor);
		}else{
			throw new RuntimeException("Connection channel descriptor is not supported");
		}
	}
}