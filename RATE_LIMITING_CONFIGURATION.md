# Rate Limiting Configuration

## Overview
The API Gateway has been configured with realistic and endpoint-specific rate limiting to balance security and usability. The rate limits have been significantly increased from the initial restrictive values.

## Rate Limit Configuration Summary

### Current Rate Limits

| Endpoint Category | Replenish Rate | Burst Capacity | Use Case |
|------------------|----------------|----------------|----------|
| **SSE Notifications** | 1000/sec | 2000 | Keep-alive connections |
| **Posts** | 500/sec | 1000 | High traffic, mixed operations |
| **General API** | 500/sec | 1000 | General API usage |
| **Public/Read Operations** | 300/sec | 600 | Public content access |
| **Suggestions** | 200/sec | 400 | Autocomplete/search |
| **Comments** | 100/sec | 200 | Moderate interaction |
| **Likes** | 100/sec | 200 | Moderate interaction |
| **Admin Operations** | 100/sec | 200 | Administrative tasks |
| **Authentication** | 30/sec | 60 | Login, register, logout |
| **Subscriptions** | 50/sec | 100 | Follow/unfollow actions |
| **File Uploads** | 20/sec | 40 | Resource intensive |
| **Default (catch-all)** | 1000/sec | 2000 | Fallback for unmapped routes |

### Previous (Too Restrictive) Values

| Endpoint Category | Previous Replenish | Previous Burst | New Replenish | New Burst | Increase Factor |
|------------------|-------------------|----------------|---------------|-----------|-----------------|
| Auth | 5/sec | 10 | 30/sec | 60 | 6x |
| API | 50/sec | 100 | 500/sec | 1000 | 10x |
| Public | 20/sec | 40 | 300/sec | 600 | 15x |
| Default | 100/sec | 150 | 1000/sec | 2000 | 10x |

## Endpoint-Specific Configuration

### 1. SSE Notifications (`/api/sse/**`)
- **Limit**: 1000/sec replenish, 2000 burst
- **Reason**: Keep-alive connections need high limits
- **Applied**: First priority route

### 2. Admin Endpoints (`/api/admin/**`)
- **Limit**: 100/sec replenish, 200 burst
- **Reason**: Moderate limits for administrative tasks
- **Applied**: Second priority route

### 3. Posts Endpoints (`/api/posts/**`)
- **Limit**: 500/sec replenish, 1000 burst
- **Reason**: High traffic, both read and write operations
- **Applied**: Third priority route

### 4. Comments Endpoints (`/api/comments/**`)
- **Limit**: 100/sec replenish, 200 burst
- **Reason**: Moderate limits for comment interactions

### 5. Likes Endpoints (`/api/likes/**`)
- **Limit**: 100/sec replenish, 200 burst
- **Reason**: Moderate limits for like interactions

### 6. Subscription Endpoints (`/api/subscriptions/**`)
- **Limit**: 50/sec replenish, 100 burst
- **Reason**: Lower limits for follow/unfollow actions

### 7. File Upload Endpoints (`/api/files/**`)
- **Limit**: 20/sec replenish, 40 burst
- **Reason**: Lower limits for resource-intensive uploads

### 8. Suggestions Endpoints (`/api/suggestions/**`)
- **Limit**: 200/sec replenish, 400 burst
- **Reason**: Higher limits for autocomplete/search

### 9. Authentication Endpoints (`/api/auth/**`)
- **Limit**: 30/sec replenish, 60 burst
- **Reason**: Moderate limits for login/register/logout

### 10. General API (`/api/**`)
- **Limit**: 500/sec replenish, 1000 burst
- **Reason**: Catch-all for other API endpoints

### 11. Default Catch-All (`/**`)
- **Limit**: 1000/sec replenish, 2000 burst
- **Reason**: Very high limits for any unmapped routes

## How Rate Limiting Works

### Token Bucket Algorithm
- **Replenish Rate**: Number of tokens added per second
- **Burst Capacity**: Maximum number of tokens in the bucket
- **Requested Tokens**: Tokens consumed per request (default: 1)

### Key Resolver
- **Primary**: User-based (from JWT token)
- **Fallback**: IP-based (for unauthenticated requests)
- **Scope**: Per user/IP combination

### Response Headers
When a request is processed, the gateway includes these headers:
- `X-RateLimit-Remaining`: Remaining tokens in bucket
- `X-RateLimit-Requested-Tokens`: Tokens consumed (typically 1)
- `X-RateLimit-Burst-Capacity`: Maximum bucket size
- `X-RateLimit-Replenish-Rate`: Tokens per second

### Rate Limit Exceeded
When a rate limit is exceeded:
- HTTP 429 (Too Many Requests)
- `X-RateLimit-Retry-After` header indicating when to retry

## Configuration Files

### Gateway Configuration
- **Location**: `gateway/src/main/java/com/example/gateway/config/GatewayConfig.java`
- Contains route definitions and rate limiter bean configurations

### Rate Limit Properties
- **Development**: `gateway/src/main/resources/application.properties`
- **Docker**: `gateway/src/main/resources/application-docker.properties`

### Redis Configuration
- **Enabled**: Yes (was previously disabled)
- **Host**: `redis` (Docker) or `localhost` (development)
- **Port**: 6379

## Testing Rate Limits

### Test Script
Use the provided test script to verify rate limiting:
```bash
./test-rates.sh
```

### Manual Testing
```bash
# Test auth endpoint (should allow 30 req/sec)
curl -X POST http://localhost:8080/api/auth/login

# Test posts endpoint (should allow 500 req/sec)
curl http://localhost:8080/api/posts

# Test file upload (should allow 20 req/sec)
curl -X POST http://localhost:8080/api/files/upload
```

### Monitoring
```bash
# Watch gateway logs for rate limit information
docker-compose -f docker-compose.dev.yml logs -f gateway | grep -i "ratelimit"
```

## Best Practices

1. **Start Conservative**: Begin with lower limits and increase as needed
2. **Monitor Usage**: Track actual usage patterns to adjust limits
3. **Per-User Limits**: Current setup uses per-user limits (better than global)
4. **Separate Read/Write**: Higher limits for read operations, lower for writes
5. **Resource-Intensive**: Lower limits for CPU/IO-heavy operations (uploads)
6. **Authentication**: Moderate limits to prevent brute force attacks

## Adjusting Rate Limits

To adjust rate limits:

1. **Edit Properties File**
   - `gateway/src/main/resources/application-docker.properties` (for Docker)
   - `gateway/src/main/resources/application.properties` (for development)

2. **Change Values**
   ```properties
   # Example: Increase auth limits to 60/sec
   ratelimit.auth.replenishRate=60
   ratelimit.auth.burstCapacity=120
   ```

3. **Restart Gateway**
   ```bash
   docker-compose -f docker-compose.dev.yml restart gateway
   ```

## Current Status

✅ **Redis Enabled**: Rate limiting is active with Redis backend
✅ **Per-Endpoint Limits**: Each endpoint category has optimized limits
✅ **Realistic Limits**: 6-15x increase from previous restrictive values
✅ **Per-User Tracking**: Limits are applied per authenticated user
✅ **Fallback to IP**: Unauthenticated requests use IP-based limits

## Next Steps

1. **Monitor Performance**: Track actual usage under production load
2. **Adjust as Needed**: Fine-tune limits based on real-world usage
3. **Add Alerting**: Set up alerts for sustained rate limit hits
4. **Documentation**: Update API documentation with rate limit information
5. **Client Guidance**: Provide clients with rate limit information

