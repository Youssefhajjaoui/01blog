# API Gateway - Spring Cloud Gateway with Redis Rate Limiting

## Overview

This is a Spring Cloud Gateway that acts as the entry point for all client requests. It provides:

- **Redis-based Rate Limiting**: Prevents abuse and ensures fair usage
- **Request Routing**: Routes requests to backend services
- **Security**: Adds gateway authentication header for backend validation
- **CORS Handling**: Centralized CORS configuration
- **Health Monitoring**: Built-in health checks and metrics

## Features

### 1. Rate Limiting

Uses **Token Bucket Algorithm** with Redis for distributed rate limiting:

- **IP-based**: For public/unauthenticated endpoints
- **User-based**: For authenticated endpoints (extracts from JWT)
- **Configurable**: Different limits per route
- **Fail-open**: Allows requests if Redis is unavailable

### 2. Intelligent Routing

Routes are configured based on path patterns:

| Route Pattern | Rate Limit | Key Type | Description |
|--------------|-----------|----------|-------------|
| `/api/auth/**` | 5 req/s | IP | Authentication endpoints |
| `/api/users/**`, `/api/posts/**`, etc. | 50 req/s | User | User-specific APIs |
| `/api/admin/**` | 50 req/s | User | Admin endpoints |
| `/posts/**`, `/api/files/**` | 20 req/s | IP | Public endpoints |
| `/api/sse/**` | 10 req/s | User | SSE connections |

### 3. Security

- Adds `X-Gateway-Secret` header to all backend requests
- Backend validates this header to ensure requests come from gateway only
- Supports JWT token extraction for user identification

### 4. Headers Added

The gateway adds the following headers:

- `X-Gateway-Secret`: Authentication for backend
- `X-RateLimit-Remaining`: Tokens left for this client
- `X-RateLimit-Replenish-Rate`: Tokens added per second
- `X-RateLimit-Burst-Capacity`: Maximum tokens allowed
- `Retry-After`: Seconds to wait (when rate limited)

## Architecture

```
┌─────────┐      ┌─────────────┐      ┌─────────┐
│ Client  │─────▶│   Gateway   │─────▶│ Backend │
└─────────┘      └─────────────┘      └─────────┘
                       │
                       ▼
                  ┌─────────┐
                  │  Redis  │
                  └─────────┘
```

## Building

### Local Development

```bash
# Build with Maven
./mvnw clean package

# Run locally
java -jar target/gateway-1.0.0.jar

# Or with Maven
./mvnw spring-boot:run
```

### Docker Build

```bash
# Build Docker image
docker build -t api-gateway .

# Run with Docker
docker run -p 8080:8080 \
  -e REDIS_HOST=redis \
  -e BACKEND_URL=http://backend:9090 \
  -e GATEWAY_SECRET=your-secret \
  api-gateway
```

## Configuration

### Application Properties

Key configuration properties in `application.properties`:

```properties
# Server
server.port=8080

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Backend
backend.url=http://localhost:9090

# Security
gateway.secret=change-this-secret-in-production

# Rate Limits
ratelimit.auth.replenishRate=5
ratelimit.auth.burstCapacity=10
ratelimit.api.replenishRate=50
ratelimit.api.burstCapacity=100
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | localhost | Redis hostname |
| `REDIS_PORT` | 6379 | Redis port |
| `REDIS_PASSWORD` | (empty) | Redis password |
| `BACKEND_URL` | http://localhost:9090 | Backend service URL |
| `GATEWAY_SECRET` | (required) | Shared secret with backend |
| `JWT_SECRET` | (required) | JWT secret for token validation |
| `CORS_ORIGINS` | localhost:4200,localhost:3000 | Allowed origins |

## Rate Limiting Details

### Token Bucket Algorithm

1. Each client has a "bucket" with tokens
2. Tokens are added at `replenishRate` per second
3. Bucket holds maximum `burstCapacity` tokens
4. Each request consumes 1 token
5. Request rejected if no tokens available

### Lua Script

The rate limiting logic is implemented in `request_rate_limiter.lua`:

- Stored in `src/main/resources/scripts/`
- Executed atomically in Redis
- Handles token calculation and expiration

### Redis Keys

Rate limiting uses these Redis keys:

```
request_rate_limiter.ip:192.168.1.1.tokens
request_rate_limiter.ip:192.168.1.1.timestamp
request_rate_limiter.user:johndoe.tokens
request_rate_limiter.user:johndoe.timestamp
```

## Key Resolvers

### IpKeyResolver

Extracts client IP from:
1. `X-Forwarded-For` header (first IP)
2. `X-Real-IP` header
3. Remote address

Returns key: `ip:192.168.1.1`

### UserKeyResolver

Extracts username from JWT token:
1. Reads `Authorization: Bearer <token>` header
2. Validates JWT with secret
3. Extracts subject (username)
4. Falls back to IP if invalid/missing

Returns key: `user:johndoe` or `ip:192.168.1.1`

## Error Handling

### Rate Limit Exceeded (429)

```json
{
  "timestamp": "2025-10-28T10:30:00.000Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 12
}
```

### Not Found (404)

```json
{
  "timestamp": "2025-10-28T10:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### Internal Server Error (500)

```json
{
  "timestamp": "2025-10-28T10:30:00.000Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Monitoring

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "redis": {
      "status": "UP"
    }
  }
}
```

### Metrics

```bash
curl http://localhost:8080/actuator/metrics
```

### Gateway Routes

```bash
curl http://localhost:8080/actuator/gateway/routes
```

## Testing

### Test Rate Limiting

```bash
# Make 20 requests quickly
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done
```

After 5-10 requests, you should see HTTP 429 responses.

### Test with JWT

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r '.token')

# Make authenticated requests
for i in {1..60}; do
  curl -X GET http://localhost:8080/api/users/me \
    -H "Authorization: Bearer $TOKEN"
  echo ""
done
```

## Customization

### Add New Route

Edit `GatewayConfig.java`:

```java
.route("custom_route", r -> r
        .path("/api/custom/**")
        .filters(f -> f
                .filter(gatewayAuthFilter)
                .requestRateLimiter(c -> c
                        .setRateLimiter(redisRateLimiter())
                        .setKeyResolver(new UserKeyResolver())
                        .configure(config -> {
                            config.setReplenishRate(30);
                            config.setBurstCapacity(60);
                            config.setRequestedTokens(1);
                        })))
        .uri(backendUrl))
```

### Custom Key Resolver

Create a new resolver:

```java
public class CustomKeyResolver implements KeyResolver {
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        String apiKey = exchange.getRequest().getHeaders().getFirst("X-API-Key");
        return Mono.just("apikey:" + apiKey);
    }
}
```

## Dependencies

- Spring Boot 3.2.0
- Spring Cloud Gateway 2023.0.0
- Spring Data Redis Reactive
- JJWT 0.12.3 (for JWT validation)

## Project Structure

```
gateway/
├── src/
│   ├── main/
│   │   ├── java/com/example/gateway/
│   │   │   ├── GatewayApplication.java
│   │   │   ├── config/
│   │   │   │   ├── GatewayConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── RedisRateLimiter.java
│   │   │   │   ├── IpKeyResolver.java
│   │   │   │   └── UserKeyResolver.java
│   │   │   ├── filter/
│   │   │   │   └── GatewayAuthenticationFilter.java
│   │   │   └── exception/
│   │   │       └── RateLimitExceptionHandler.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-docker.properties
│   │       └── scripts/
│   │           └── request_rate_limiter.lua
├── Dockerfile
├── pom.xml
└── README.md
```

## Production Checklist

- [ ] Set strong `GATEWAY_SECRET`
- [ ] Set strong `JWT_SECRET`
- [ ] Configure `CORS_ORIGINS` with production domains
- [ ] Enable Redis password (`REDIS_PASSWORD`)
- [ ] Adjust rate limits based on traffic
- [ ] Set up monitoring and alerts
- [ ] Configure log aggregation
- [ ] Enable HTTPS/TLS
- [ ] Set resource limits in Docker
- [ ] Configure backup for Redis

## Performance

- **Latency**: ~2-5ms overhead per request
- **Throughput**: 10,000+ req/s (depends on Redis)
- **Memory**: ~512MB baseline
- **Redis**: 100 bytes per rate limit key

## Troubleshooting

### Gateway won't start

Check logs:
```bash
docker logs api-gateway
```

Common issues:
- Redis not reachable
- Invalid configuration
- Port 8080 already in use

### Rate limiting not working

Verify Redis:
```bash
docker exec -it redis redis-cli
KEYS request_rate_limiter*
```

### Backend returns 403

Check gateway secret matches in both services.

## License

Same as parent project.

