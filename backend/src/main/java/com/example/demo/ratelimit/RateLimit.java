package com.example.demo.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.concurrent.TimeUnit;

/**
 * Annotation for rate limiting endpoints.
 * 
 * Usage examples:
 * - @RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES) // 10 requests per minute
 * - @RateLimit(limit = 100, duration = 1, unit = TimeUnit.HOURS) // 100 requests per hour
 * - @RateLimit(limit = 5, duration = 1, unit = TimeUnit.SECONDS, keyType = KeyType.IP) // Per IP
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    
    /**
     * Maximum number of requests allowed
     */
    int limit() default 100;
    
    /**
     * Time window duration
     */
    long duration() default 1;
    
    /**
     * Time unit for duration
     */
    TimeUnit unit() default TimeUnit.MINUTES;
    
    /**
     * Key type for rate limiting
     */
    KeyType keyType() default KeyType.USER;
    
    /**
     * Custom error message when rate limit is exceeded
     */
    String message() default "Too many requests. Please try again later.";
    
    enum KeyType {
        USER,      // Rate limit per user (authenticated)
        IP,        // Rate limit per IP address
        GLOBAL,    // Global rate limit
        CUSTOM     // Custom key (use with customKeyProvider)
    }
}

