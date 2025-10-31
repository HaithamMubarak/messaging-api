package com.hmdev.messaging.common;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdev.messaging.common.security.MySecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;


public class HttpClient {
    private static final Logger logger = LoggerFactory.getLogger(HttpClient.class);

    public enum RequestMethod {

        GET("get"),
        HEAD("head"),
        POST("post"),
        PUT("put"),
        PATCH("patch"),
        DELETE("delete"),
        OPTIONS("options"),
        TRACE("trace");

        final String value;

        RequestMethod(String value) {
            this.value = value;
        }

        public String value() {
            return this.value.toUpperCase();
        }

        public static RequestMethod fromString(String value) {

            for (RequestMethod method : RequestMethod.values()) {
                if (method.value.equalsIgnoreCase(value)) {
                    return method;
                }
            }

            return null;
        }
    }

    private final long oldDate = System.currentTimeMillis();
    private final int requestsLimit = 12;

    private int requests = 0;
    private boolean enabled = true;

    private final String remoteUrl;
    private final Set<HttpURLConnection> pendingConnections;
    private final ObjectMapper mapper;

    private Cipher pubKeyEncryptor;
    // Optional default headers to be applied to every request (e.g., X-Api-Key)
    private final java.util.Map<String, String> defaultHeaders = new java.util.HashMap<>();

    public HttpClient(String remoteUrl) {
        this.remoteUrl = remoteUrl;
        pendingConnections = new HashSet<>();
        mapper = new ObjectMapper();
    }

    public void setDefaultHeader(String name, String value) {
        if (name == null) return;
        if (value == null) {
            defaultHeaders.remove(name);
        } else {
            defaultHeaders.put(name, value);
        }
    }

    public HttpClientResult request(String url) {
        return request(RequestMethod.GET, url, "", 0);
    }

    public HttpClientResult request(RequestMethod method, String url, Object payload) {
        return request(method, url, payload, 0);
    }

    public HttpClientResult request(RequestMethod method, String url, Object payload, int timeout) {
        if (!enabled) {
            return null;
        }

        long newDate = System.currentTimeMillis();

        if ((newDate - oldDate) < 1500) {
            requests++;
        }

        if (requests > requestsLimit) {
            enabled = false;
            CommonUtils.sleep(5000);
            enabled = true;
            requests = 0;

            return new HttpClientResult(0, "connection-reset");
        }

        url = getUrl(this.remoteUrl, url);

        HttpURLConnection con = null;
        try {

            if (method == RequestMethod.GET && payload instanceof String && CommonUtils.isNotEmpty(payload)) {
                url += "?data=" + URLEncoder.encode(MySecurity.blocksEncrypt(this.pubKeyEncryptor, payload.toString()),
                        StandardCharsets.UTF_8);
            }

            logger.debug("\nSending '{}' request to URL : {}", method, url);
            logger.debug("Payload : {}", payload);

            URL urlObj = new URL(url);
            con = (HttpURLConnection) urlObj.openConnection();
            pendingConnections.add(con);

            //add request headers
            con.setRequestMethod(method.value());
            con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
            con.setRequestProperty("Accept", "*/*");
            con.setRequestProperty("Content-Type", "application/json");

            // apply any default headers set by caller (e.g., X-Api-Key)
            if (!defaultHeaders.isEmpty()) {
                for (java.util.Map.Entry<String, String> e : defaultHeaders.entrySet()) {
                    try {
                        con.setRequestProperty(e.getKey(), e.getValue());
                    } catch (Exception ex) {
                        logger.debug("Unable to set default header {}: {}", e.getKey(), ex.getMessage());
                    }
                }
            }

            if (timeout > 0) {
                con.setConnectTimeout(timeout);
            }

            if (method != RequestMethod.GET && CommonUtils.isNotEmpty(payload)) {
                con.setDoOutput(true);
                DataOutputStream wr = new DataOutputStream(con.getOutputStream());

                String payloadString;

                if (payload instanceof String) {
                    payloadString = payload.toString();
                    wr.writeBytes(payload.toString());
                }
                else
                {
                    payloadString =  mapper.writeValueAsString(payload);
                }

                wr.writeBytes(MySecurity.blocksEncrypt(this.pubKeyEncryptor, payloadString));
                wr.flush();
                wr.close();
            }

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(con.getInputStream()));

            int responseCode = con.getResponseCode();
            logger.debug("Response Code : {}", responseCode);

            StringBuilder response = new StringBuilder();

            char[] buff = new char[1024];

            int n;
            while ((n = in.read(buff)) != -1) {
                for (int i = 0; i < n; i++) {
                    response.append(buff[i]);
                }

            }

            in.close();

            HttpClientResult result = new HttpClientResult(con.getResponseCode(), response.toString());

            logger.debug("HttpClient result : {}", result);

            return result;

        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (con != null) {
                con.disconnect();
            }
            pendingConnections.remove(con);
        }
    }

    public void setPublicKeyEncryptor(Cipher pubKeyEncryptor) {
        this.pubKeyEncryptor = pubKeyEncryptor;
    }

    private static String getUrl(String base, String relative) {
        String url = base + "/" + relative;
        url = url.replaceAll("\\\\", "/").replaceAll("/+", "/").replace(":/", "://");

        return url;
    }

    public void closeAll() {

        enabled = false;

        for (HttpURLConnection con : pendingConnections) {
            try {
                con.disconnect();
            } catch (Exception e) {
                logger.error("Unexpected error", e);
            }
        }

        enabled = true;

    }


}