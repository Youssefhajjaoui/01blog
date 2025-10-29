# API Gateway with Redis Rate Limiting - Setup Guide

## Overview

This guide explains the new architecture with an API Gateway that handles rate limiting **before** requests reach your backend, saving resources and improving performance.

## Architecture

```
Client → API Gateway (Port 8080) → Backend (Port 9090)
              ↓
           Redis (Rate Limiting)
```

### Key Benefits

1. **Resource Efficiency**: Rate limiting happens at gateway level, preventing resource allocation for rejected requests
2. **Centralized Rate Limiting**: Single point of control for all rate limiting rules
3. **Security**: Backend only accepts requests from gateway (using shared secret)
4. **Scalability**: Redis-based distributed rate limiting works across multiple instances
5. **Better Performance**: Requests are rejected faster without hitting backend threads

## Quick Start

### 1. Start with Docker Compose

```bash
# Copy environment variables
cp gateway.env.example .env

# Edit .env and set your secrets
nano .env

# Start all services (gateway, backend, postgres, redis, frontend)
docker-compose -f docker-compose.gateway.yml up -d

# View logs
docker-compose -f docker-compose.gateway.yml logs -f gateway
```

### 2. Test the Gateway

The gateway runs on port **8080** (instead of backend's 9090).

```bash
# Health check
curl http://localhost:8080/actuator/health

# Test rate limiting (try making 20 requests quickly)
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done

# You should see HTTP 429 (Too Many Requests) after 5-10 requests
```

## Configuration

### Rate Limiting Rules

The gateway has different rate limits for different endpoints:

#### 1. Authentication Endpoints (`/api/auth/**`)
- **Rate**: 5 requests/second per IP
- **Burst**: 10 requests
- **Why**: Prevents brute force attacks

#### 2. API Endpoints (`/api/users/**`, `/api/posts/**`, etc.)
- **Rate**: 50 requests/second per user
- **Burst**: 100 requests
- **Why**: Fair usage for authenticated users

#### 3. Public Endpoints (`/posts/**`, `/api/files/**`)
- **Rate**: 20 requests/second per IP
- **Burst**: 40 requests
- **Why**: Prevent abuse of public resources

#### 4. Admin Endpoints (`/api/admin/**`)
- **Rate**: 50 requests/second per user
- **Burst**: 100 requests
- **Why**: Moderate limits for admin operations

### Customizing Rate Limits

Edit `gateway/src/main/resources/application.properties`:

```properties
# Auth endpoints - stricter limits
ratelimit.auth.replenishRate=5
ratelimit.auth.burstCapacity=10

# API endpoints - moderate limits
ratelimit.api.replenishRate=50
ratelimit.api.burstCapacity=100

# Public endpoints - balanced limits
ratelimit.public.replenishRate=20
ratelimit.public.burstCapacity=40
```

**Understanding the Parameters:**
- `replenishRate`: Tokens added per second (average rate)
- `burstCapacity`: Maximum tokens in bucket (allows bursts)
- `requestedTokens`: Tokens consumed per request (usually 1)

### Security Configuration

#### Gateway Secret

The gateway adds a secret header (`X-Gateway-Secret`) to all requests. The backend validates this header.

**Set in `.env`:**
```bash
GATEWAY_SECRET=your-super-secret-gateway-key-change-in-production
```

**Important**: 
- Use a strong random string in production
- Both gateway and backend must have the same secret
- Backend will reject requests without valid secret

#### Disable Gateway Authentication (Local Development)

If you want to run the backend standalone for local development:

```properties
# backend/src/main/resources/application.properties
gateway.enabled=false
```

## Rate Limiting Algorithm

The gateway uses **Token Bucket Algorithm**:

1. Each user/IP has a "bucket" of tokens
2. Tokens are added at `replenishRate` per second
3. Bucket can hold maximum `burstCapacity` tokens
4. Each request consumes `requestedTokens` (usually 1)
5. If bucket is empty, request is rejected with HTTP 429

### Example:

```
replenishRate = 10
burstCapacity = 20

- User makes 20 requests instantly → All pass (burst allowed)
- User makes 21st request → Rejected (bucket empty)
- After 1 second → 10 tokens refilled
- User can make 10 more requests
```

## Response Headers

The gateway adds rate limiting headers to responses:

```
X-RateLimit-Remaining: 45         # Tokens left
X-RateLimit-Replenish-Rate: 50    # Tokens/second
X-RateLimit-Burst-Capacity: 100   # Max tokens
Retry-After: 12                   # Seconds to wait (on 429)
```

## Rate Limit Exceeded Response

When rate limit is exceeded, the gateway returns:

```json
{
  "timestamp": "2025-10-28T10:30:00.000Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 12
}
```

## Monitoring

### Gateway Health

```bash
curl http://localhost:8080/actuator/health
```

### Redis Monitoring

```bash
# Connect to Redis
docker exec -it redis redis-cli

# View rate limit keys
KEYS request_rate_limiter*

# Check specific key
GET request_rate_limiter.ip:192.168.1.1.tokens
TTL request_rate_limiter.ip:192.168.1.1.tokens
```

### Gateway Logs

```bash
docker-compose -f docker-compose.gateway.yml logs -f gateway
```

## Updating Frontend

Update your frontend to use the gateway URL:

```typescript
// Before
const API_URL = 'http://localhost:9090';

// After
const API_URL = 'http://localhost:8080';
```

## Production Deployment

### 1. Set Strong Secrets

```bash
# Generate strong gateway secret
openssl rand -base64 32

# Generate strong JWT secret
openssl rand -base64 64
```

### 2. Configure Environment

```bash
# Production .env
GATEWAY_SECRET=<generated-gateway-secret>
JWT_SECRET=<generated-jwt-secret>
CORS_ORIGINS=https://yourdomain.com
FILE_STORAGE_BASE_URL=https://yourdomain.com/api/files/uploads/
```

### 3. Enable Redis Password

```bash
# Add to docker-compose.gateway.yml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
  
# Update .env
REDIS_PASSWORD=<strong-redis-password>
```

### 4. Deploy

```bash
docker-compose -f docker-compose.gateway.yml up -d
```

## Troubleshooting

### Issue: Backend returns 403 Forbidden

**Cause**: Gateway secret mismatch or not configured

**Solution**:
```bash
# Check gateway logs
docker logs api-gateway

# Ensure GATEWAY_SECRET is set in both gateway and backend
docker-compose -f docker-compose.gateway.yml down
docker-compose -f docker-compose.gateway.yml up -d
```

### Issue: Rate limit not working

**Cause**: Redis not connected or configuration issue

**Solution**:
```bash
# Check Redis
docker exec -it redis redis-cli ping

# Check gateway logs
docker logs api-gateway | grep -i redis

# Verify Redis connection
docker exec -it redis redis-cli KEYS request_rate_limiter*
```

### Issue: All requests getting 429

**Cause**: Rate limits too strict or Redis clock issues

**Solution**:
```bash
# Check rate limit configuration
docker exec -it api-gateway cat /app/BOOT-INF/classes/application.properties | grep ratelimit

# Clear Redis rate limit data
docker exec -it redis redis-cli FLUSHDB
```

## Migration from Backend Rate Limiting

If you were using the backend's AOP-based rate limiting:

### Option 1: Disable Backend Rate Limiting

Since gateway handles it, you can disable backend rate limiting:

```java
// Comment out or remove @RateLimit annotations
// @RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES)
@PostMapping("/api/posts")
public ResponseEntity<?> createPost(@RequestBody PostRequest request) {
    // Your logic
}
```

### Option 2: Keep as Secondary Defense

You can keep both layers:
- Gateway: Primary rate limiting (saves resources)
- Backend: Secondary rate limiting (additional security)

Just ensure backend limits are higher than gateway limits to avoid conflicts.

## Performance Tuning

### High Traffic Scenarios

For high-traffic applications, increase limits:

```properties
# gateway/src/main/resources/application.properties
ratelimit.api.replenishRate=200
ratelimit.api.burstCapacity=400
```

### Redis Optimization

```bash
# Increase Redis memory
docker-compose.gateway.yml:
  redis:
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --appendonly yes
```

## Advanced Configuration

### Per-User Rate Limiting

The gateway automatically extracts username from JWT token for user-based rate limiting.

### IP-based Rate Limiting

For unauthenticated requests, gateway uses client IP (supports X-Forwarded-For).

### Custom Rate Limit Keys

Modify `gateway/src/main/java/com/example/gateway/config/GatewayConfig.java` to add custom routes with specific limits.

## Support

- **Gateway Issues**: Check `docker logs api-gateway`
- **Backend Issues**: Check `docker logs backend`
- **Redis Issues**: Check `docker logs redis`
- **Network Issues**: Check `docker network inspect blog-network`

## Summary

✅ Gateway handles rate limiting **before** backend receives requests  
✅ Saves CPU, memory, and thread resources  
✅ Redis-based distributed rate limiting  
✅ Backend secured with gateway secret  
✅ Different rate limits for different endpoints  
✅ Production-ready with health checks and monitoring  

**Next Steps:**
1. Update frontend to use port 8080 (gateway)
2. Test rate limiting with your endpoints
3. Adjust rate limits based on your needs
4. Monitor Redis and gateway logs
5. Set strong secrets for production

