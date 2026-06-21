package com.carbonledger.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    public void testHandleValidationExceptions() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("objectName", "fieldName", "defaultMessage");
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationExceptions(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(HttpStatus.BAD_REQUEST.value(), body.get("status"));
        assertEquals("Validation Error", body.get("error"));
        
        Map<?, ?> details = (Map<?, ?>) body.get("details");
        assertEquals("defaultMessage", details.get("fieldName"));
    }

    @Test
    public void testHandleBadRequest_IllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid argument message");
        ResponseEntity<Map<String, Object>> response = handler.handleBadRequest(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("Bad Request", body.get("error"));
        assertEquals("Invalid argument message", body.get("message"));
    }

    @Test
    public void testHandleBadRequest_IllegalState() {
        IllegalStateException ex = new IllegalStateException("Invalid state message");
        ResponseEntity<Map<String, Object>> response = handler.handleBadRequest(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("Bad Request", body.get("error"));
        assertEquals("Invalid state message", body.get("message"));
    }

    @Test
    public void testHandleAllExceptions() {
        Exception ex = new Exception("Generic error message");
        ResponseEntity<Map<String, Object>> response = handler.handleAllExceptions(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("Internal Server Error", body.get("error"));
        assertEquals("An unexpected error occurred. Please contact support.", body.get("message"));
    }
}
