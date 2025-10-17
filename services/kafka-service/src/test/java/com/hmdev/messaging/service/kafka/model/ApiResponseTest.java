package com.hmdev.messaging.service.kafka.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for ApiResponse model.
 */
public class ApiResponseTest {
    
    @Test
    public void testSuccessResponse() {
        String testData = "test data";
        ApiResponse<String> response = ApiResponse.success(testData);
        
        assertEquals("ok", response.getStatus());
        assertEquals("Success", response.getMessage());
        assertEquals(testData, response.getData());
    }
    
    @Test
    public void testErrorResponse() {
        String errorMessage = "Error occurred";
        ApiResponse<String> response = ApiResponse.error(errorMessage);
        
        assertEquals("error", response.getStatus());
        assertEquals(errorMessage, response.getMessage());
        assertNull(response.getData());
    }
    
    @Test
    public void testSettersAndGetters() {
        ApiResponse<Integer> response = new ApiResponse<>();
        response.setStatus("ok");
        response.setMessage("Test message");
        response.setData(42);
        
        assertEquals("ok", response.getStatus());
        assertEquals("Test message", response.getMessage());
        assertEquals(42, response.getData());
    }
}
