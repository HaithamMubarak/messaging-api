package com.hmdev.messaging.service.kafka.data;

public class JsonResponse {
    public String message;
    public Object data;
    public String status;

    private JsonResponse() {
    }

    public static JsonResponse ok() {
        return ok(null);
    }

    public static JsonResponse ok(Object data) {
        JsonResponse response = new JsonResponse();
        response.status = "ok";
        response.data = data;
        return response;
    }

    public static JsonResponse error(Object msg) {
        JsonResponse response = new JsonResponse();
        response.status = "error";
        response.message = msg.toString();
        return response;
    }

    public static JsonResponse unauthorized(String msg) {
        JsonResponse response = new JsonResponse();
        response.status = "unauthorized";
        response.message = msg;
        return response;
    }
}
