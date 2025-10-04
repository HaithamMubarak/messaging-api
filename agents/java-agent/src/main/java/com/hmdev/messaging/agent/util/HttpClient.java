package com.hmdev.messaging.agent.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import javax.net.ssl.HttpsURLConnection;


public class HttpClient {
    private static final Logger logger = LoggerFactory.getLogger(HttpClient.class);

    public static enum RequestMethod {

        GET("get"),
        HEAD("head"),
        POST("post"),
        PUT("put"),
        PATCH("patch"),
        DELETE("delete"),
        OPTIONS("options"),
        TRACE("trace");

        String value;

        private RequestMethod(String value) {
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

    private long oldDate = System.currentTimeMillis();
    private int requests = 0;
    private int requestsLimit = 12;
    private boolean enabled = true;

    private final String remoteUrl;

    private final Set<HttpURLConnection> pendingConnections;

    public HttpClient(String remoteUrl) {
        this.remoteUrl = remoteUrl;
        pendingConnections = new HashSet<HttpURLConnection>();
    }

    public ApiResponse request(String url) {
        return request(RequestMethod.GET, url, "", 0);
    }

    public ApiResponse request(RequestMethod method, String url, String payload) {
        return request(method, url, payload, 0);
    }

    public ApiResponse request(RequestMethod method, String url, String payload, int timeout) {
        if (!enabled) {
            return null;
        }

        long newDate = System.currentTimeMillis();

        if ((newDate - oldDate) < 1500) {
            requests++;
        }

        if (requests > requestsLimit) {
            enabled = false;
            Utils.sleep(5000);
            enabled = true;
            requests = 0;

            return new ApiResponse("error", "connection-reset");
        }

        url = getUrl(this.remoteUrl, url);

        HttpURLConnection con = null;
        try {

            if (method == RequestMethod.GET && payload != null && !payload.equals("")) {
                url += "?data=" + URLEncoder.encode(payload, "UTF-8");
            }

            logger.debug("\nSending '" + method + "' request to URL : " + url);
            logger.debug("Payload : " + payload);

            URL urlObj = new URL(url);
            con = (HttpURLConnection) urlObj.openConnection();
            pendingConnections.add(con);

            //add request headers
            con.setRequestMethod(method.value());
            con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
            con.setRequestProperty("Accept", "*/*");

            if (timeout > 0) {
                con.setConnectTimeout(timeout);
            }

            if (method != RequestMethod.GET && payload != null && !payload.equals("")) {
                con.setDoOutput(true);
                DataOutputStream wr = new DataOutputStream(con.getOutputStream());
                wr.writeBytes(payload);
                wr.flush();
                wr.close();
            }

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(con.getInputStream()));

            int responseCode = con.getResponseCode();
            logger.debug("Response Code : " + responseCode);

            StringBuffer response = new StringBuffer();

            char[] buff = new char[1024];

            int n;
            while ((n = in.read(buff)) != -1) {
                for (int i = 0; i < n; i++) {
                    response.append(buff[i]);
                }

            }

            in.close();

            if (con.getResponseCode() == HttpsURLConnection.HTTP_OK) {
                return new ApiResponse("success", response.toString());
            } else {
                return new ApiResponse("error", response.toString());
            }

        } catch (java.net.SocketTimeoutException e) {
            logger.error("Unexpected error", e);
            return new ApiResponse("error", "connection-timeout:" + e.getLocalizedMessage());
        } catch (java.io.IOException e) {
            logger.error("Unexpected error", e);
            return new ApiResponse("error", "io-error:" + e.getLocalizedMessage());
        } catch (Exception e) {
            logger.error("Unexpected error", e);
            return new ApiResponse("error", "exception:" + e.getLocalizedMessage());
        } finally {
            if (con != null) {
                con.disconnect();
            }
            pendingConnections.remove(con);
        }
    }

    private static String getUrl(String base, String relative) {
        String url = base + "/" + relative;
        url = url.replaceAll("\\\\", "/").replaceAll("/+", "/").replace(":/", "://");

        return url;
    }

    private static String[] parseKeyValue(String token) {
        if (token == null || token.equals("")) {
            return null;
        }

        token = token.trim();

        int index = token.indexOf("=");

        if (index == -1) {
            return new String[]{token.trim(), ""};
        } else {
            return new String[]{token.substring(0, index).trim(), token.substring(index + 1).trim()};
        }

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