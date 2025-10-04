package com.hmdev.messaging.agent.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import org.json.JSONObject;


/**
 *
 * @author Haitham Mubarak
 *
 */
public class ApiResponse {
    private static final Logger logger = LoggerFactory.getLogger(ApiResponse.class);

    public enum Status {
        SUCCESS, ERROR;

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

    private final Status status;
    private String data;
    private JSONObject jsonData;
    private Integer updateLength;

    public ApiResponse(Status status, JSONObject jsonData) {
        this.status = status;
        this.jsonData = jsonData;
    }

    public ApiResponse(String status, String data) {
        this(Status.fromString(status), data, null);
    }

    public ApiResponse(Status status, String data) {
        this(status, data, null);
    }

    public ApiResponse(Status status, String data, Integer updateLength) {
        this.status = status;
        this.data = data;
        this.updateLength = updateLength;
    }

    public Status status() {
        return status;
    }

    public String getData() {
        return data;
    }

    public JSONObject getJsonData() {
        return jsonData;
    }

    public Integer getUpdateLength() {
        return updateLength;
    }

    public ApiResponse asJsonResponse() {
        return new ApiResponse(this.status, new JSONObject(this.data));
    }

    public String toString() {
        JSONObject obj = new JSONObject();
        obj.put("status", status);
        obj.put("data", data);
        obj.put("jsonData", jsonData);
        obj.put("updateLength", updateLength);

        return obj.toString(2);
    }

}