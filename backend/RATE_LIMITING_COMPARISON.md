# Rate Limiting: Comparison & Best Practices

## Why Redis for Rate Limiting?

### ✅ Advantages
1. **Distributed**: Works across multiple app instances
2. **Fast**: In-memory storage with O(1) operations
3. **Atomic Operations**: Built-in commands for counters and sorted sets
4. **Expiry**: Automatic cleanup with TTL
5. **Already in Your Stack**: You're using Redis for caching

### ❌ Without Redis
- Each app instance has its own limits (not shared)
- Restart resets all counters
- Can't scale horizontally

## Algorithm Comparison

### 1. Fixed Window Counter ⚡ (Simple but Flawed)

**How it works:**
```
Time:    [0-60s] [60-120s] [120-180s]
Limit:   10/min   10/min    10/min
Requests: ||||||||  |||||     |||
```

**Pros:**
- Simple to implement
- Low memory usage
- Fast

**Cons:**
- Can allow 2x limit at window boundaries
- Example: 10 requests at 59s + 10 at 61s = 20 in 2 seconds!

**When to use:**
- Non-critical endpoints
- Memory-constrained systems

---

### 2. Sliding Window Counter 🎯 (Recommended)

**How it works:**
```
Time:    [----------------60s window----------------]
         Tracks individual request timestamps
Requests: |  |    ||   |  |     ||  |    |
         Old requests expire as window slides
```

**Pros:**
- Accurate rate limiting
- Prevents burst at boundaries
- Fair for all time periods

**Cons:**
- More memory (stores timestamps)
- Slightly more complex

**When to use:**
- Authentication endpoints (prevent brute force)
- Payment/billing endpoints
- Any critical endpoint

**Implementation:**
```java
// Uses sorted sets in Redis
rateLimiter.isAllowedSlidingWindow(key, 10, 1, TimeUnit.MINUTES)
```

---

### 3. Token Bucket 🪣 (Advanced)

**How it works:**
```
Bucket capacity: 10 tokens
Refill rate: 1 token/second
Each request consumes 1 token
If bucket empty → reject
```

**Pros:**
- Allows controlled bursts
- Smooth traffic flow
- Predictable behavior

**Cons:**
- More complex logic
- Needs background refill process

**When to use:**
- API gateways
- Variable request costs
- Burst-tolerant systems

---

### 4. Leaky Bucket 💧 (Traffic Shaping)

**How it works:**
```
Requests enter at any rate
Leak out at fixed rate
If bucket full → reject
```

**Pros:**
- Smooth output rate
- Best for traffic shaping

**Cons:**
- Most complex
- Can delay requests

**When to use:**
- Rate-limited external APIs
- Queue-based systems

---

## Implementation Comparison

### Option 1: Custom Implementation (What We Built) ⭐

```java
@RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES)
@PostMapping("/api/posts")
public ResponseEntity<?> createPost() { ... }
```

**Pros:**
- Full control over logic
- No external dependencies (except Redis)
- Easy to customize
- Educational value

**Cons:**
- You maintain the code
- Need thorough testing

---

### Option 2: Bucket4j Library

```java
@Configuration
public class RateLimitConfig {
    @Bean
    public Bucket createBucket() {
        return Bucket.builder()
            .addLimit(Bandwidth.simple(10, Duration.ofMinutes(1)))
            .build();
    }
}
```

**Pros:**
- Battle-tested
- Multiple algorithms
- Good documentation

**Cons:**
- Extra dependency
- More complex configuration
- Learning curve

---

### Option 3: Spring Cloud Gateway

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: rate_limit_route
          uri: http://localhost:8080
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

**Pros:**
- Part of Spring ecosystem
- Gateway-level control

**Cons:**
- Requires API gateway
- Less flexible
- Overkill for simple apps

---

## Recommended Setup for Your Blog App

### Step 1: Add Rate Limiting to Critical Endpoints

**Priority 1: Authentication (Prevent Brute Force)**
```java
// AuthController.java
@RateLimit(limit = 5, duration = 1, unit = TimeUnit.MINUTES, keyType = RateLimit.KeyType.IP)
@PostMapping("/api/auth/login")
public ResponseEntity<?> login(@RequestBody UserLoginDto loginDto) { ... }
```

**Priority 2: Content Creation (Prevent Spam)**
```java
// PostController.java
@RateLimit(limit = 10, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
@PostMapping("/api/posts")
public ResponseEntity<?> createPost(@RequestBody PostRequest request) { ... }

// CommentController.java  
@RateLimit(limit = 30, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
@PostMapping("/api/comments")
public ResponseEntity<?> createComment(@RequestBody CommentRequest request) { ... }
```

**Priority 3: File Uploads (Prevent Abuse)**
```java
// FileController.java
@RateLimit(limit = 20, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
@PostMapping("/api/files/upload")
public ResponseEntity<?> uploadFile(@RequestParam MultipartFile file) { ... }
```

---

## Monitoring & Observability

### Add Response Headers for Client Visibility

Modify `RateLimitAspect.java` to add headers:

```java
@Around("@annotation(com.example.demo.ratelimit.RateLimit)")
public Object rateLimit(ProceedingJoinPoint joinPoint) throws Throwable {
    // ... existing code ...
    
    // Add rate limit info to response headers
    HttpServletResponse response = getCurrentResponse();
    int remaining = rateLimiterService.getRemainingRequests(key, rateLimit.limit());
    long resetTime = rateLimiterService.getResetTime(key);
    
    response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimit.limit()));
    response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
    response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + (resetTime * 1000)));
    
    return joinPoint.proceed();
}
```

**Client can now see:**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1698765432000
```

---

## Testing Your Rate Limiter

### 1. Manual Testing with cURL

```bash
# Test login rate limit
for i in {1..6}; do
  curl -X POST http://localhost:9090/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo "Request $i"
done

# Expected: First 5 succeed, 6th returns 429
```

### 2. Load Testing with Apache Bench

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:9090/api/posts
```

### 3. Monitor Redis Keys

```bash
# Connect to Redis
docker exec -it redis-cache redis-cli

# List rate limit keys
KEYS rate_limit:*

# Check specific key
GET rate_limit:sliding:user:john:createPost
ZRANGE rate_limit:sliding:user:john:createPost 0 -1 WITHSCORES
```

---

## Performance Metrics

### Memory Usage (per user, per endpoint)

| Algorithm | Memory per User | For 1000 Users |
|-----------|----------------|----------------|
| Fixed Window | ~50 bytes | ~50 KB |
| Sliding Window | ~2 KB | ~2 MB |
| Token Bucket | ~100 bytes | ~100 KB |

### Latency Impact

- Fixed Window: +1-2ms per request
- Sliding Window: +2-5ms per request
- Both negligible for most applications

---

## Best Practices Summary

### ✅ DO
1. Use **Sliding Window** for critical endpoints (auth, payments)
2. Use **Fixed Window** for non-critical endpoints (analytics)
3. Set **keyType = IP** for unauthenticated endpoints
4. Set **keyType = USER** for authenticated endpoints
5. Monitor rate limit hits in logs
6. Return informative error messages
7. Add response headers for transparency
8. Test rate limits thoroughly

### ❌ DON'T
1. Don't set limits too strict (UX suffers)
2. Don't rate limit health checks or monitoring endpoints
3. Don't ignore Redis connection failures (handle gracefully)
4. Don't use same limit for all endpoints
5. Don't forget to document limits in API docs

---

## Troubleshooting

### Issue: Rate limits not enforced
**Solution:** Check Redis connection and AOP is enabled

### Issue: Rate limits too aggressive
**Solution:** Adjust limits based on real usage patterns

### Issue: Different results across instances
**Solution:** Ensure all instances use same Redis server

### Issue: Memory growing in Redis
**Solution:** Check TTL is set correctly on keys

---

## Next Steps

1. ✅ Add dependencies (already done)
2. ✅ Create rate limiting classes (already done)
3. 🔲 Add `@RateLimit` to your controllers
4. 🔲 Test with curl or Postman
5. 🔲 Monitor logs for violations
6. 🔲 Adjust limits based on usage
7. 🔲 Add monitoring dashboard (optional)

---

## Additional Resources

- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
- [Bucket4j Documentation](https://bucket4j.com/)
- [API Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies)

