# Rate Limiting Implementation Guide

## Overview

This guide explains how to use the Redis-based rate limiting system in your application.

## How It Works

The rate limiter uses **Sliding Window Counter algorithm** with Redis for distributed rate limiting:

1. **Sliding Window**: More accurate than fixed windows, tracks individual requests
2. **Redis Storage**: Enables distributed rate limiting across multiple app instances
3. **Fail-Open Strategy**: If Redis is unavailable, requests are allowed (configurable)

## Rate Limiting Algorithms Explained

### 1. Fixed Window Counter (Basic)
- Resets counter at fixed intervals
- Simple but can allow 2x limit at window boundaries
- Use `isAllowed()` method

### 2. Sliding Window Counter (Recommended)
- Tracks individual requests with timestamps
- More accurate, prevents burst at boundaries
- Use `isAllowedSlidingWindow()` method (default in @RateLimit)

## Usage Examples

### Basic Usage - Annotation-Based

Simply add `@RateLimit` annotation to any controller method:

```java
@RestController
@RequestMapping("/api")
public class MyController {
    
    // Limit to 10 requests per minute per user
    @RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES)
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody PostRequest request) {
        // Your logic here
    }
    
    // Limit to 5 requests per second per IP (for login attempts)
    @RateLimit(
        limit = 5, 
        duration = 1, 
        unit = TimeUnit.SECONDS,
        keyType = RateLimit.KeyType.IP,
        message = "Too many login attempts. Please try again later."
    )
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Your login logic
    }
    
    // Global rate limit (applies to all users)
    @RateLimit(
        limit = 1000, 
        duration = 1, 
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.GLOBAL
    )
    @GetMapping("/public/stats")
    public ResponseEntity<?> getStats() {
        // Your stats logic
    }
}
```

### Key Types

#### 1. USER (Default)
Rate limits per authenticated user. Falls back to IP if not authenticated.
```java
@RateLimit(limit = 100, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
```

#### 2. IP
Rate limits per IP address (useful for public endpoints).
```java
@RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES, keyType = RateLimit.KeyType.IP)
```

#### 3. GLOBAL
Single rate limit for all users combined.
```java
@RateLimit(limit = 10000, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.GLOBAL)
```

## Response Format

When rate limit is exceeded, returns HTTP 429 with:

```json
{
  "timestamp": "2025-10-26T18:00:00.000Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

Headers included:
- `X-RateLimit-Retry-After`: Seconds until rate limit resets
- `Retry-After`: Seconds until rate limit resets (standard header)

## Programmatic Usage

If you need more control, inject `RateLimiterService`:

```java
@Service
public class MyService {
    
    private final RateLimiterService rateLimiter;
    
    public MyService(RateLimiterService rateLimiter) {
        this.rateLimiter = rateLimiter;
    }
    
    public void processRequest(String userId) {
        String key = "custom:operation:" + userId;
        
        // Check with sliding window (recommended)
        boolean allowed = rateLimiter.isAllowedSlidingWindow(
            key, 
            100,  // limit
            1,    // duration
            TimeUnit.HOURS
        );
        
        if (!allowed) {
            long retryAfter = rateLimiter.getResetTime(key);
            throw new RateLimitException("Rate limit exceeded", retryAfter);
        }
        
        // Get remaining requests
        int remaining = rateLimiter.getRemainingRequests(key, 100);
        System.out.println("Remaining requests: " + remaining);
        
        // Your business logic
    }
}
```

## Best Practices

### 1. Choose Appropriate Limits

**Authentication Endpoints:**
```java
@RateLimit(limit = 5, duration = 1, unit = TimeUnit.MINUTES, keyType = RateLimit.KeyType.IP)
```
Prevents brute force attacks.

**API Endpoints (Authenticated):**
```java
@RateLimit(limit = 100, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
```
Fair usage per user.

**Public Endpoints:**
```java
@RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES, keyType = RateLimit.KeyType.IP)
```
Prevents abuse from single IP.

**Resource-Intensive Operations:**
```java
@RateLimit(limit = 10, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
```
Strict limits for expensive operations.

### 2. Configure Redis Properly

Ensure Redis is accessible:
```properties
# application.properties
spring.data.redis.host=redis
spring.data.redis.port=6379
```

### 3. Monitor Rate Limits

Add logging to track rate limit violations:
```java
@Aspect
@Component
public class RateLimitLogger {
    
    @AfterThrowing(
        pointcut = "@annotation(com.example.demo.ratelimit.RateLimit)",
        throwing = "ex"
    )
    public void logRateLimitViolation(JoinPoint joinPoint, RateLimitException ex) {
        String method = joinPoint.getSignature().toShortString();
        log.warn("Rate limit exceeded for method: {}", method);
    }
}
```

### 4. Different Limits for Different Tiers

```java
@PostMapping("/api/generate")
public ResponseEntity<?> generate(Authentication auth) {
    User user = getCurrentUser(auth);
    
    int limit = switch(user.getTier()) {
        case FREE -> 10;
        case PREMIUM -> 100;
        case ENTERPRISE -> 1000;
    };
    
    String key = "generate:" + user.getId();
    if (!rateLimiter.isAllowedSlidingWindow(key, limit, 1, TimeUnit.HOURS)) {
        throw new RateLimitException("Upgrade to increase limit", 3600);
    }
    
    // Process request
}
```

## Testing

### Unit Tests
```java
@Test
void testRateLimit() {
    RateLimiterService rateLimiter = new RateLimiterService(redisTemplate);
    
    // First 5 requests should succeed
    for (int i = 0; i < 5; i++) {
        assertTrue(rateLimiter.isAllowedSlidingWindow("test", 5, 1, TimeUnit.MINUTES));
    }
    
    // 6th request should fail
    assertFalse(rateLimiter.isAllowedSlidingWindow("test", 5, 1, TimeUnit.MINUTES));
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class RateLimitIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testRateLimitOnEndpoint() throws Exception {
        // Make 10 requests (limit)
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/posts"))
                .andExpect(status().isOk());
        }
        
        // 11th request should be rate limited
        mockMvc.perform(post("/api/posts"))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.error").value("Too Many Requests"));
    }
}
```

## Troubleshooting

### Rate Limits Not Working
1. Check Redis connection
2. Verify AOP is enabled (should be automatic with spring-boot-starter-aop)
3. Ensure method is public and called from outside the class

### Redis Connection Errors
The system uses fail-open strategy by default. Change in `RateLimiterService`:
```java
// Fail-closed (reject requests when Redis is down)
return false; // instead of return true;
```

## Performance Considerations

- **Memory**: Each rate limit key uses ~100 bytes in Redis
- **Network**: 2 Redis calls per request (remove old + add new)
- **Optimization**: Consider using local cache for high-traffic scenarios

## Advanced: Custom Rate Limit Strategies

You can extend with custom strategies:

```java
@Service
public class CustomRateLimitStrategy {
    
    // Leaky bucket algorithm
    public boolean checkLeakyBucket(String key, int capacity, int leakRate) {
        // Implementation
    }
    
    // Token bucket with refill
    public boolean checkTokenBucket(String key, int capacity, int refillRate) {
        // Implementation
    }
}
```

## Monitoring Dashboard (Optional)

Track rate limit usage:
```java
@RestController
@RequestMapping("/api/admin/rate-limits")
public class RateLimitAdminController {
    
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        // Query Redis for rate limit keys
        // Return usage statistics
    }
}
```

