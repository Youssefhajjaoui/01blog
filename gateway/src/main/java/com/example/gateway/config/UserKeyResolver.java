package com.example.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Resolves rate limit key based on authenticated user from JWT token
 * Falls back to IP if user is not authenticated
 */
@Component
public class UserKeyResolver implements KeyResolver {
    
    @Value("${jwt.secret:my-super-secret-jwt-key-that-should-be-at-least-256-bits-long-for-hs256-algorithm}")
    private String jwtSecret;
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = extractUsername(token);
                if (username != null && !username.isEmpty()) {
                    return Mono.just("user:" + username);
                }
            } catch (Exception e) {
                // Invalid token, fall back to IP
            }
        }
        
        // Fall back to IP-based rate limiting for unauthenticated requests
        return Mono.just("ip:" + getClientIp(exchange));
    }
    
    private String extractUsername(String token) {
        try {
            SecretKey key = new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8), 
                "HmacSHA256"
            );
            
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getClientIp(ServerWebExchange exchange) {
        String ip = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
        }
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = exchange.getRequest().getRemoteAddress() != null 
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown";
        }
        
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip != null ? ip : "unknown";
    }
}

