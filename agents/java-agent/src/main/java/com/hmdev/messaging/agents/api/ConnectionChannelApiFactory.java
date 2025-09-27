package com.hmdev.messaging.agents.api;

import com.hmdev.messaging.agents.api.http.HTTPChannelApi;



public abstract class ConnectionChannelApiFactory {
	
	private ConnectionChannelApiFactory(){
		super();
	}
	
	public static ConnectionChannelApi getConnectionApi(String description) throws Exception{
		if(description.startsWith("https://")){
			return new HTTPChannelApi(description);
		}else{
			throw new Exception("Connection channel description is not supported");
		}
	}
}
