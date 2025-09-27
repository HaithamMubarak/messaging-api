package com.hmdev.messaging.agents;

import org.json.JSONArray;

public class Main {

    public static void main(String[] args) throws Exception {

        String apiUrl = "https://hmdevonline.com/messaging-api/origin-service";

        ConnectionChannel connectionChannel = new ConnectionChannel("java-agent");
        connectionChannel.connect(apiUrl, "system001", "12345678");

        //connectionChannel.sendMessage("This is a private message for java apis only :)", "java-api-.*", true);


        connectionChannel.sendMessage("Hello, I am a java-agent");

        connectionChannel.receiveAsync(new ChannelEventHandler() {
            @Override
            public void onMessageEvents(JSONArray messageEvents) {
                System.out.println("New Message events:");
                for (int i = 0; i < messageEvents.length(); i++) {
                    System.out.println(messageEvents.getJSONObject(i).toString(2));
                }
            }
        });
    }
}
