package com.hmdev.messaging.agent.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.*;

public final class Utils {
    private Utils() { /* no instances */ }

    private static final Logger logger = LoggerFactory.getLogger(Utils.class);

    private static final String SESSION_FILE_EXT = "txt";

    // Method to save the session ID to a file
    public static void saveSessionId(String channelName, String sessionId) {
        String fileName = channelName + "-session." + SESSION_FILE_EXT;

        // Define the file path (use user's home directory for simplicity)
        File file = new File(System.getProperty("user.home"), fileName);

        // Write the session ID to the file (single line)
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write(sessionId);
            logger.debug("Session ID saved to file: " + file.getAbsolutePath());
        } catch (IOException e) {
            logger.error("Unexpected error", e);
        }
    }

    // Method to load the session ID from a file
    public static String loadSessionId(String channelName) {
        String fileName = channelName + "-session." + SESSION_FILE_EXT;

        // Define the file path (use user's home directory for simplicity)
        File file = new File(System.getProperty("user.home"), fileName);

        if (!file.isFile())
        {
            return null;
        }
        // Read the session ID from the file (single line)
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            return reader.readLine();  // Read the first line, which is the session ID
        } catch (IOException e) {
            logger.error("Unexpected error", e);
            return null;  // Return null if file doesn't exist or can't be read
        }
    }
}