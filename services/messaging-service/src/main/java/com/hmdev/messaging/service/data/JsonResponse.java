package com.hmdev.messaging.service.data;

public class JsonResponse {

    public String status;
    public String statusMessage;
    public Object data;

    private JsonResponse() {
    }

    public static JsonResponse success() {
        return success(null);
    }

    public static JsonResponse success(Object data) {
        JsonResponse response = new JsonResponse();
        response.status = "success";
        response.data = data;
        return response;
    }

    public static JsonResponse error(Object msg) {
        JsonResponse response = new JsonResponse();
        response.status = "error";
        response.statusMessage = msg.toString();
        return response;
    }

    public static JsonResponse unauthorized(String msg) {
        JsonResponse response = new JsonResponse();
        response.status = "unauthorized";
        response.statusMessage = msg;
        return response;
    }
}
