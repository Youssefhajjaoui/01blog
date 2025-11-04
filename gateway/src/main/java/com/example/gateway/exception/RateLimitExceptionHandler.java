package com.example.gateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.cloud.gateway.support.NotFoundException;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the gateway
 * Handles rate limiting and other errors with proper JSON responses
 */
@Component
@Order(-1)
public class RateLimitExceptionHandler implements ErrorWebExceptionHandler {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        DataBufferFactory bufferFactory = exchange.getResponse().bufferFactory();
        
        // Check if response already has 429 status code (from rate limiter)
        org.springframework.http.HttpStatusCode statusCode = exchange.getResponse().getStatusCode();
        if (statusCode != null && statusCode.isSameCodeAs(HttpStatus.TOO_MANY_REQUESTS)) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("timestamp", Instant.now().toString());
            errorBody.put("status", 429);
            errorBody.put("error", "Too Many Requests");
            errorBody.put("message", "Rate limit exceeded. Please try again later.");
            
            // Add retry-after header if available
            String retryAfter = exchange.getResponse().getHeaders().getFirst("X-RateLimit-Retry-After");
            if (retryAfter != null) {
                errorBody.put("retryAfter", retryAfter);
                exchange.getResponse().getHeaders().set("Retry-After", retryAfter);
            }
            
            DataBuffer dataBuffer;
            try {
                dataBuffer = bufferFactory.wrap(objectMapper.writeValueAsBytes(errorBody));
            } catch (JsonProcessingException e) {
                dataBuffer = bufferFactory.wrap("{}".getBytes());
            }
            
            return exchange.getResponse().writeWith(Mono.just(dataBuffer));
        }
        
        // Check for ResponseStatusException with 429
        if (ex instanceof org.springframework.web.server.ResponseStatusException) {
            org.springframework.web.server.ResponseStatusException rse = 
                (org.springframework.web.server.ResponseStatusException) ex;
            
            if (rse.getStatusCode().isSameCodeAs(HttpStatus.TOO_MANY_REQUESTS)) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                
                Map<String, Object> errorBody = new HashMap<>();
                errorBody.put("timestamp", Instant.now().toString());
                errorBody.put("status", 429);
                errorBody.put("error", "Too Many Requests");
                errorBody.put("message", "Rate limit exceeded. Please try again later.");
                
                // Add retry-after header if available
                String retryAfter = exchange.getResponse().getHeaders().getFirst("X-RateLimit-Retry-After");
                if (retryAfter != null) {
                    errorBody.put("retryAfter", retryAfter);
                    exchange.getResponse().getHeaders().set("Retry-After", retryAfter);
                }
                
                DataBuffer dataBuffer;
                try {
                    dataBuffer = bufferFactory.wrap(objectMapper.writeValueAsBytes(errorBody));
                } catch (JsonProcessingException e) {
                    dataBuffer = bufferFactory.wrap("{}".getBytes());
                }
                
                return exchange.getResponse().writeWith(Mono.just(dataBuffer));
            }
        }
        
        if (ex instanceof NotFoundException) {
            exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("timestamp", Instant.now().toString());
            errorBody.put("status", 404);
            errorBody.put("error", "Not Found");
            errorBody.put("message", "The requested resource was not found");
            
            DataBuffer dataBuffer;
            try {
                dataBuffer = bufferFactory.wrap(objectMapper.writeValueAsBytes(errorBody));
            } catch (JsonProcessingException e) {
                dataBuffer = bufferFactory.wrap("{}".getBytes());
            }
            
            return exchange.getResponse().writeWith(Mono.just(dataBuffer));
        }
        
        // Generic error response
        exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("timestamp", Instant.now().toString());
        errorBody.put("status", 500);
        errorBody.put("error", "Internal Server Error");
        errorBody.put("message", "An unexpected error occurred");
        
        DataBuffer dataBuffer;
        try {
            dataBuffer = bufferFactory.wrap(objectMapper.writeValueAsBytes(errorBody));
        } catch (JsonProcessingException e) {
            dataBuffer = bufferFactory.wrap("{}".getBytes());
        }
        
        return exchange.getResponse().writeWith(Mono.just(dataBuffer));
    }
}

