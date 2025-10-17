package com.hmdev.messaging.common;

import lombok.Getter;
import org.json.JSONArray;
import org.json.JSONObject;


/**
 *
 * @author Haitham Mubarak
 *
 */
@Getter
public class HttpClientResult {

    public enum Status {
        SUCCESS, ERROR, EXCEPTION;

        public static Status fromString(String status) {
            if (status.equalsIgnoreCase("success")) {
                return SUCCESS;
            } else if (status.equalsIgnoreCase("error")) {
                return ERROR;
            } else {
                return null;
            }
        }
    }

    private final int statusCode;
    private final String data;

    public HttpClientResult(int statusCode, String data) {
        this.statusCode = statusCode;
        this.data = data;
    }

    public JSONObject dataAsJsonObject() {
        return new JSONObject(data);
    }

    public JSONArray dataAsJsonArray() {
        return new JSONArray(data);
    }

    public boolean isHttpOk()
    {
        return statusCode == 200 || statusCode == 201;
    }

    public String toString() {
        JSONObject obj = new JSONObject();
        obj.put("statusCode", statusCode);
        obj.put("data", data);

        return obj.toString(2);
    }

}