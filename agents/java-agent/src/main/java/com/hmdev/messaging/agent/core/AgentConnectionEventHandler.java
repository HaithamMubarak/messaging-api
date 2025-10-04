package com.hmdev.messaging.agent.core;


import com.hmdev.messaging.agent.data.MessageEvent;

import java.util.List;

/**
 * Callback interface for receiving message events from an AgentConnection.
 */
public interface AgentConnectionEventHandler {

	/**
	 * Invoked when a batch of events is received.
	 * @param messageEvents JSONArray of events as provided by the API
	 */
	void onMessageEvents(List<MessageEvent> messageEvents);
}