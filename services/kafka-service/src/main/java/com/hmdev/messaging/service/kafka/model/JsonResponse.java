package com.hmdev.messaging.service.kafka.model;

public class JsonResponse {
    public boolean ok;
    public String message; // nullable
    public String data;    // may be plain string or JSON-encoded string
    public String status;  // "pending" or "unauthorized"

    private JsonResponse() { }

    public static JsonResponse ok(String dataAlreadyEncodedOrString) {
        JsonResponse response = new JsonResponse();
        response.ok = true;
        response.data = dataAlreadyEncodedOrString;
        return response;
    }

    public static JsonResponse error(String msg) {
        JsonResponse response = new JsonResponse();
        response.ok = false;
        response.message = msg;
        return response;
    }

    public static JsonResponse pending(String msg) {
        JsonResponse response = new JsonResponse();
        response.ok = true;
        response.status = "pending";
        response.message = msg;
        return response;
    }

    public static JsonResponse unauthorized(String msg) {
        JsonResponse response = new JsonResponse();
        response.ok = false;
        response.status = "unauthorized";
        response.message = msg;
        return response;
    }
}
