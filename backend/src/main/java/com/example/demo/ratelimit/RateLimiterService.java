package com.example.demo.ratelimit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Redis-based rate limiter using Token Bucket algorithm.
 * 
 * This implementation uses Redis for distributed rate limiting across multiple instances.
 * Uses Sliding Window Counter algorithm for accurate rate limiting.
 */
@Service
public class RateLimiterService {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    public RateLimiterService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    
    /**
     * Check if the request is allowed based on rate limit
     * 
     * @param key The unique key for rate limiting (e.g., user:123, ip:192.168.1.1)
     * @param limit Maximum number of requests allowed
     * @param duration Time window duration
     * @param unit Time unit for duration
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean isAllowed(String key, int limit, long duration, TimeUnit unit) {
        String rateLimitKey = "rate_limit:" + key;
        long windowSizeInSeconds = unit.toSeconds(duration);
        
        try {
            // Get current count
            String currentCountStr = redisTemplate.opsForValue().get(rateLimitKey);
            int currentCount = currentCountStr != null ? Integer.parseInt(currentCountStr) : 0;
            
            if (currentCount >= limit) {
                return false;
            }
            
            // Increment counter
            Long newCount = redisTemplate.opsForValue().increment(rateLimitKey);
            
            // Set expiry only for the first request
            if (newCount != null && newCount == 1) {
                redisTemplate.expire(rateLimitKey, Duration.ofSeconds(windowSizeInSeconds));
            }
            
            return true;
            
        } catch (Exception e) {
            // If Redis is down, allow the request (fail-open strategy)
            // You can change this to fail-closed by returning false
            return true;
        }
    }
    
    /**
     * Get remaining requests for a key
     */
    public int getRemainingRequests(String key, int limit) {
        String rateLimitKey = "rate_limit:" + key;
        String currentCountStr = redisTemplate.opsForValue().get(rateLimitKey);
        int currentCount = currentCountStr != null ? Integer.parseInt(currentCountStr) : 0;
        return Math.max(0, limit - currentCount);
    }
    
    /**
     * Get time until reset in seconds
     */
    public long getResetTime(String key) {
        String rateLimitKey = "rate_limit:" + key;
        Long ttl = redisTemplate.getExpire(rateLimitKey, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }
    
    /**
     * Sliding Window Counter algorithm (more accurate)
     * Uses sorted sets in Redis to track individual requests
     */
    public boolean isAllowedSlidingWindow(String key, int limit, long duration, TimeUnit unit) {
        String rateLimitKey = "rate_limit:sliding:" + key;
        long windowSizeInMillis = unit.toMillis(duration);
        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - windowSizeInMillis;
        
        try {
            // Remove old entries outside the window
            redisTemplate.opsForZSet().removeRangeByScore(rateLimitKey, 0, windowStart);
            
            // Count current requests in window
            Long count = redisTemplate.opsForZSet().count(rateLimitKey, windowStart, currentTime);
            
            if (count != null && count >= limit) {
                return false;
            }
            
            // Add current request
            redisTemplate.opsForZSet().add(rateLimitKey, String.valueOf(currentTime), currentTime);
            
            // Set expiry on the key
            redisTemplate.expire(rateLimitKey, Duration.ofMillis(windowSizeInMillis));
            
            return true;
            
        } catch (Exception e) {
            return true; // Fail-open strategy
        }
    }
}

