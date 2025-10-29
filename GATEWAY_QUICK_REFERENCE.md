# API Gateway - Quick Reference

## 🚀 Quick Commands

### Start Everything
```bash
./start-gateway.sh
```

### Start Manually
```bash
docker-compose -f docker-compose.gateway.yml up -d
```

### Stop
```bash
docker-compose -f docker-compose.gateway.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.gateway.yml logs -f

# Gateway only
docker logs -f api-gateway

# Backend only
docker logs -f backend
```

## 📡 Service URLs

| Service | URL | Access |
|---------|-----|--------|
| **API Gateway** | http://localhost:8080 | Public (use this) |
| Backend | http://localhost:9090 | Internal only |
| PostgreSQL | localhost:5432 | Internal only |
| Redis | localhost:6379 | Internal only |
| Frontend | http://localhost:4200 | Public |

## 🔍 Health Checks

```bash
# Gateway
curl http://localhost:8080/actuator/health

# Backend
curl http://localhost:9090/actuator/health

# Redis
docker exec -it redis redis-cli ping
```

## 🧪 Test Rate Limiting

### Test Auth Endpoint (5 req/s limit)
```bash
for i in {1..20}; do 
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done
```

Expected: First 5-10 succeed, rest get HTTP 429

### Test with Authentication
```bash
# Login and get token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"password"}' | jq -r '.token')

# Make authenticated requests (50 req/s limit)
for i in {1..60}; do
  curl http://localhost:8080/api/users/me \
    -H "Authorization: Bearer $TOKEN"
  echo ""
done
```

## 📊 Rate Limit Configuration

| Endpoint Pattern | Limit | Type | Purpose |
|-----------------|-------|------|---------|
| `/api/auth/**` | 5 req/s | IP | Prevent brute force |
| `/api/users/**`, `/api/posts/**` | 50 req/s | User | Fair usage |
| `/api/admin/**` | 50 req/s | User | Admin operations |
| `/posts/**`, `/api/files/**` | 20 req/s | IP | Public access |
| `/api/sse/**` | 10 req/s | User | Long connections |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `gateway/src/main/resources/application.properties` | Gateway config (local) |
| `gateway/src/main/resources/application-docker.properties` | Gateway config (docker) |
| `backend/src/main/resources/application.properties` | Backend config (local) |
| `backend/src/main/resources/application-docker.properties` | Backend config (docker) |
| `docker-compose.gateway.yml` | Docker services |
| `gateway.env.example` | Environment variables template |

## 🔐 Security

### Gateway Secret
The gateway adds `X-Gateway-Secret` header to all requests. Backend validates this.

```bash
# Set in .env or environment
GATEWAY_SECRET=your-super-secret-key

# Must match in both gateway and backend
```

### Disable Gateway Auth (Local Dev)
In `backend/src/main/resources/application.properties`:
```properties
gateway.enabled=false
```

## 📈 Monitoring

### View Rate Limit Keys in Redis
```bash
docker exec -it redis redis-cli

# List all rate limit keys
KEYS request_rate_limiter*

# Check specific key
GET request_rate_limiter.ip:192.168.1.1.tokens
TTL request_rate_limiter.ip:192.168.1.1.tokens

# View value and expiry
GET request_rate_limiter.user:johndoe.tokens
TTL request_rate_limiter.user:johndoe.tokens
```

### Clear Rate Limits
```bash
# Clear all rate limit data
docker exec -it redis redis-cli FLUSHDB

# Clear specific key pattern
docker exec -it redis redis-cli --eval <(echo "return redis.call('del', unpack(redis.call('keys', ARGV[1])))") , "request_rate_limiter*"
```

### View Gateway Routes
```bash
curl http://localhost:8080/actuator/gateway/routes | jq
```

### View Metrics
```bash
curl http://localhost:8080/actuator/metrics
```

## 🐛 Troubleshooting

### Problem: Backend returns 403
**Cause:** Gateway secret mismatch

**Solution:**
```bash
# Check if secrets match
docker exec api-gateway env | grep GATEWAY_SECRET
docker exec backend env | grep GATEWAY_SECRET

# Restart services
docker-compose -f docker-compose.gateway.yml restart
```

### Problem: Rate limits not working
**Cause:** Redis connection issue

**Solution:**
```bash
# Check Redis
docker exec -it redis redis-cli ping

# Check gateway logs
docker logs api-gateway | grep -i redis

# Verify connection
docker exec api-gateway nc -zv redis 6379
```

### Problem: All requests get 429
**Cause:** Rate limits too strict or time sync issue

**Solution:**
```bash
# Clear Redis
docker exec -it redis redis-cli FLUSHDB

# Check system time
docker exec api-gateway date
docker exec redis date

# Restart services
docker-compose -f docker-compose.gateway.yml restart gateway redis
```

### Problem: Gateway won't start
**Cause:** Port conflict or missing dependencies

**Solution:**
```bash
# Check if port 8080 is in use
lsof -i :8080
# Or on Linux
netstat -tulpn | grep 8080

# Kill process using the port
kill -9 <PID>

# Check logs
docker logs api-gateway

# Rebuild
docker-compose -f docker-compose.gateway.yml up -d --build gateway
```

## 🎯 Common Tasks

### Update Rate Limits

Edit `gateway/src/main/resources/application.properties`:
```properties
ratelimit.auth.replenishRate=10  # Increase from 5 to 10
ratelimit.auth.burstCapacity=20  # Increase from 10 to 20
```

Rebuild and restart:
```bash
cd gateway
./mvnw clean package -DskipTests
cd ..
docker-compose -f docker-compose.gateway.yml up -d --build gateway
```

### Add New Route with Custom Rate Limit

Edit `gateway/src/main/java/com/example/gateway/config/GatewayConfig.java`:

```java
.route("my_custom_route", r -> r
        .path("/api/custom/**")
        .filters(f -> f
                .filter(gatewayAuthFilter)
                .requestRateLimiter(c -> c
                        .setRateLimiter(redisRateLimiter())
                        .setKeyResolver(new UserKeyResolver())
                        .configure(config -> {
                            config.setReplenishRate(100);  // 100 req/s
                            config.setBurstCapacity(200);  // burst to 200
                            config.setRequestedTokens(1);
                        })))
        .uri(backendUrl))
```

### Update Frontend to Use Gateway

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'  // Changed from 9090 to 8080
};
```

### Generate Secure Secrets

```bash
# Gateway secret
openssl rand -base64 32

# JWT secret
openssl rand -base64 64
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `GATEWAY_SETUP_GUIDE.md` | Complete setup guide |
| `ARCHITECTURE_COMPARISON.md` | Before/after comparison |
| `gateway/README.md` | Gateway module documentation |
| `GATEWAY_QUICK_REFERENCE.md` | This file |

## 🔄 Deployment Workflow

### Development
```bash
# Local development (no gateway auth)
gateway.enabled=false  # in backend application.properties
```

### Staging
```bash
# Enable gateway auth, use test secrets
GATEWAY_SECRET=test-secret-for-staging
docker-compose -f docker-compose.gateway.yml up -d
```

### Production
```bash
# Strong secrets, monitoring enabled
GATEWAY_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
docker-compose -f docker-compose.gateway.yml up -d

# Set up monitoring
# Enable HTTPS
# Configure log aggregation
```

## 🎓 Best Practices

1. ✅ Always use gateway in production
2. ✅ Set strong secrets (32+ characters)
3. ✅ Monitor rate limit metrics
4. ✅ Adjust limits based on traffic patterns
5. ✅ Keep Redis persistent (use volumes)
6. ✅ Enable Redis password in production
7. ✅ Use HTTPS in production
8. ✅ Keep gateway and backend rate limits coordinated
9. ✅ Test rate limiting before deploying
10. ✅ Monitor Redis memory usage

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker-compose -f docker-compose.gateway.yml logs`
2. Verify health: `curl http://localhost:8080/actuator/health`
3. Check Redis: `docker exec -it redis redis-cli ping`
4. Review configuration in `application.properties`
5. Ensure secrets match between gateway and backend
6. Check network connectivity: `docker network inspect blog-network`

## 📞 Support Resources

- Gateway Documentation: `gateway/README.md`
- Setup Guide: `GATEWAY_SETUP_GUIDE.md`
- Architecture: `ARCHITECTURE_COMPARISON.md`
- Rate Limiting Guide: `backend/RATE_LIMITING_GUIDE.md`

