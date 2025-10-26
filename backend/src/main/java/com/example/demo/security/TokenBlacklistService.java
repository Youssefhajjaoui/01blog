package com.example.demo.security;

import java.time.Duration;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final JwtUtil jwtUtil;
    
    private static final String BLACKLIST_PREFIX = "blacklist:";
    
    public TokenBlacklistService(RedisTemplate<String, String> redisTemplate, JwtUtil jwtUtil) {
        this.redisTemplate = redisTemplate;
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * Add a token to the blacklist using Redis
     * Stores only the token ID (jti) for memory efficiency
     */
    public void blacklistToken(String token) {
        try {
            // Extract token ID (jti) from the token
            String tokenId = jwtUtil.extractTokenId(token);
            if (tokenId == null || tokenId.isEmpty()) {
                // Fallback: use token hash if no jti
                tokenId = String.valueOf(token.hashCode());
            }
            
            // Calculate time until token expiration
            long expirationTime = jwtUtil.getExpirationTime(token);
            long ttlMillis = expirationTime - System.currentTimeMillis();
            
            if (ttlMillis > 0) {
                // Store in Redis with automatic expiration
                String key = BLACKLIST_PREFIX + tokenId;
                redisTemplate.opsForValue().set(key, "true", Duration.ofMillis(ttlMillis));
            }
        } catch (Exception e) {
            // Fallback: store with default TTL (15 minutes)
            String tokenId = String.valueOf(token.hashCode());
            String key = BLACKLIST_PREFIX + tokenId;
            redisTemplate.opsForValue().set(key, "true", Duration.ofMinutes(15));
        }
    }
    
    /**
     * Check if a token is blacklisted
     * Returns true if the token ID exists in Redis
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            // Extract token ID (jti) from the token
            String tokenId = jwtUtil.extractTokenId(token);
            if (tokenId == null || tokenId.isEmpty()) {
                // Fallback: use token hash if no jti
                tokenId = String.valueOf(token.hashCode());
            }
            
            String key = BLACKLIST_PREFIX + tokenId;
            Boolean exists = redisTemplate.hasKey(key);
            return exists != null && exists;
        } catch (Exception e) {
            // If Redis is down or error occurs, fail open (allow request)
            // In production, you might want to fail closed (deny request)
            return false;
        }
    }
    
    /**
     * Blacklist all tokens for a specific user by username
     * Useful for admin actions like banning a user
     */
    public void blacklistAllUserTokens(String username) {
        // Store a marker that this user's tokens should be rejected
        String key = BLACKLIST_PREFIX + "user:" + username;
        redisTemplate.opsForValue().set(key, "true", Duration.ofDays(30));
    }
    
    /**
     * Check if all tokens for a user are blacklisted
     */
    public boolean isUserBlacklisted(String username) {
        try {
            String key = BLACKLIST_PREFIX + "user:" + username;
            Boolean exists = redisTemplate.hasKey(key);
            return exists != null && exists;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Remove user from blacklist
     */
    public void removeUserFromBlacklist(String username) {
        String key = BLACKLIST_PREFIX + "user:" + username;
        redisTemplate.delete(key);
    }
    
    /**
     * Get the number of blacklisted tokens (for monitoring)
     * Note: This is an expensive operation in Redis, use sparingly
     */
    public long getBlacklistSize() {
        try {
            var keys = redisTemplate.keys(BLACKLIST_PREFIX + "*");
            return keys != null ? keys.size() : 0;
        } catch (Exception e) {
            return -1; // Error occurred
        }
    }
}

