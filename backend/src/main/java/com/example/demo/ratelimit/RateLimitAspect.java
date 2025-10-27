package com.example.demo.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * Aspect that intercepts methods annotated with @RateLimit and enforces rate limiting
 */
@Aspect
@Component
public class RateLimitAspect {
    
    private final RateLimiterService rateLimiterService;
    
    public RateLimitAspect(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }
    
    @Around("@annotation(com.example.demo.ratelimit.RateLimit)")
    public Object rateLimit(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RateLimit rateLimit = method.getAnnotation(RateLimit.class);
        
        // Generate rate limit key based on KeyType
        String key = generateKey(rateLimit.keyType(), method);
        
        // Check rate limit using sliding window algorithm (more accurate)
        boolean allowed = rateLimiterService.isAllowedSlidingWindow(
            key, 
            rateLimit.limit(), 
            rateLimit.duration(), 
            rateLimit.unit()
        );
        
        if (!allowed) {
            long retryAfter = rateLimiterService.getResetTime(key);
            throw new RateLimitException(rateLimit.message(), retryAfter);
        }
        
        // Proceed with the method execution
        return joinPoint.proceed();
    }
    
    private String generateKey(RateLimit.KeyType keyType, Method method) {
        switch (keyType) {
            case USER:
                return getUserKey(method);
            case IP:
                return getIpKey(method);
            case GLOBAL:
                return getGlobalKey(method);
            case CUSTOM:
                return getCustomKey(method);
            default:
                return getGlobalKey(method);
        }
    }
    
    private String getUserKey(Method method) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() 
                || "anonymousUser".equals(authentication.getPrincipal())) {
            // Fall back to IP if user is not authenticated
            return getIpKey(method);
        }
        
        String username = authentication.getName();
        return String.format("user:%s:%s", username, method.getName());
    }
    
    private String getIpKey(Method method) {
        HttpServletRequest request = getCurrentRequest();
        String ipAddress = getClientIp(request);
        return String.format("ip:%s:%s", ipAddress, method.getName());
    }
    
    private String getGlobalKey(Method method) {
        return String.format("global:%s:%s", 
            method.getDeclaringClass().getSimpleName(), 
            method.getName());
    }
    
    private String getCustomKey(Method method) {
        // Can be extended to support custom key providers
        return getGlobalKey(method);
    }
    
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes();
        return attributes.getRequest();
    }
    
    private String getClientIp(HttpServletRequest request) {
        // Check for X-Forwarded-For header (for proxied requests)
        String ip = request.getHeader("X-Forwarded-For");
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // If multiple IPs in X-Forwarded-For, take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip != null ? ip : "unknown";
    }
}

