package com.hmdev.messaging.agents;

import org.json.JSONArray;

public interface ChannelEventHandler {
	
	public void onMessageEvents(JSONArray messageEvents);
}
