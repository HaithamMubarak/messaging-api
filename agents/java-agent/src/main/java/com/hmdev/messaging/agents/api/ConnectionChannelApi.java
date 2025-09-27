package com.hmdev.messaging.agents.api;

import com.hmdev.messaging.agents.utils.ApiResponse;

public interface ConnectionChannelApi {

	public ApiResponse connect(String channelName,String channelKey,String user) throws Exception;	
	public ApiResponse receive(String channelKey,String session,String range);	
	public ApiResponse send(String msg,String fromUsr,String toUser,String key,String session);
	public ApiResponse disconnect(String channelKey,String session);	

}
