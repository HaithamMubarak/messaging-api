package com.hmdev.messaging.common.examples;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.ApiConstants;
import com.hmdev.messaging.common.crypto.EnvelopeUtil;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.PublicKey;
import java.util.Base64;

/**
 * Small demonstration of a domain-server that polls the messaging-service envelope consume endpoint
 * for `channel_request:<channelId>` entries and automatically replies with a PASSWORD_REPLY
 * encrypted to the requester's public key.
 *
 * Usage (example):
 *   java -cp <classpath> com.hmdev.messaging.common.examples.DomainServerPoller http://localhost:8080 <apiKey> channel-123 my-channel-password
 */
public class DomainServerPoller {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        if (args.length < 4) {
            System.err.println("Usage: DomainServerPoller <serviceBaseUrl> <apiKey> <channelId> <channelPassword>");
            System.exit(2);
        }
        String baseUrl = args[0];
        String apiKey = args[1];
        String channelId = args[2];
        String channelPassword = args[3];

        String recipientQueue = "channel_request:" + channelId;
        String encodedRecipient = urlEncode(recipientQueue);
        String consumeUrl = String.format("%s/api/envelopes/%s/consume?limit=10", baseUrl, encodedRecipient);

        System.out.println("Polling " + consumeUrl);

        String[] envelopes = httpGetJsonArray(consumeUrl, apiKey);
        if (envelopes == null || envelopes.length == 0) {
            System.out.println("No requests found");
            return;
        }

        for (String envJson : envelopes) {
            JsonNode env = mapper.readTree(envJson);
            if (!env.has("type") || !"REQUEST_PASSWORD".equals(env.get("type").asText())) continue;

            String requester = env.has("from") ? env.get("from").asText() : null;
            String requesterPubB64 = env.has("content") ? env.get("content").asText() : null;
            if (requester == null || requesterPubB64 == null) continue;

            System.out.println("Processing request from " + requester + " pubkey=" + requesterPubB64);

            // Decode requester's public key
            PublicKey requesterPub = EnvelopeUtil.decodePublicKey(requesterPubB64);

            // Create ephemeral keypair and encrypt the channelPassword to the requester
            KeyPair eph = EnvelopeUtil.generateX25519KeyPair();
            byte[] plaintext = channelPassword.getBytes(StandardCharsets.UTF_8);
            String envelopeJson = EnvelopeUtil.createEnvelope(eph.getPrivate(), eph.getPublic(), requesterPub, plaintext, channelId, requester);

            // Build PASSWORD_REPLY wrapper expected by EnvelopeController
            JsonNode replyNode = mapper.createObjectNode()
                    .put("type", "PASSWORD_REPLY")
                    .put("from", "domain-server")
                    .put("channelId", channelId)
                    .put("envelope", envelopeJson)
                    .put("date", System.currentTimeMillis());

            String replyBody = mapper.writeValueAsString(replyNode);

            // POST the reply to the recipient's envelope list so the requester can poll/consume it
            String postUrl = String.format("%s/api/envelopes/%s", baseUrl, urlEncode(requester));
            httpPostJson(postUrl, replyBody);
            System.out.println("Posted PASSWORD_REPLY for " + requester + " to " + postUrl);
        }
    }

    private static String[] httpGetJsonArray(String urlStr, String apiKey) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Accept", "application/json");
        if (apiKey != null && !apiKey.isEmpty()) conn.setRequestProperty(ApiConstants.HEADER_API_KEY, apiKey);

        int rc = conn.getResponseCode();
        if (rc != 200) {
            System.err.println("GET " + urlStr + " returned " + rc);
            return new String[0];
        }
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            String body = sb.toString();
            // The controller returns a JSON array as the response body for /api/envelopes/{recipient}/consume
            return mapper.readValue(body, String[].class);
        }
    }

    private static void httpPostJson(String urlStr, String jsonBody) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        byte[] out = jsonBody.getBytes(StandardCharsets.UTF_8);
        conn.setFixedLengthStreamingMode(out.length);
        conn.connect();
        try (OutputStream os = conn.getOutputStream()) {
            os.write(out);
        }
        int rc = conn.getResponseCode();
        if (rc < 200 || rc >= 300) {
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line; while ((line = br.readLine()) != null) sb.append(line);
                System.err.println("POST error: " + sb.toString());
            } catch (Exception ignore) {}
        }
    }

    private static String urlEncode(String s) {
        try { return java.net.URLEncoder.encode(s, StandardCharsets.UTF_8.toString()); } catch (Exception e) { return s; }
    }
}

