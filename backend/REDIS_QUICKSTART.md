# Redis JWT Blacklist - Quick Start

## 🚀 How to Run

### Option 1: Local Development (Easiest)

```bash
# 1. Start Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine

# 2. Start Backend
cd backend
./mvnw spring-boot:run

# 3. Test it works
curl http://localhost:9090/api/auth/me
```

### Option 2: Docker Compose (Recommended)

```bash
# Start everything (PostgreSQL + Redis + Backend + Frontend)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop everything
docker-compose -f docker-compose.dev.yml down
```

---

## ✅ What Changed

### 1. **JWT Tokens Now Have Unique IDs**
```json
{
  "sub": "username",
  "jti": "550e8400-e29b-41d4-a716-446655440000",  ← NEW
  "roles": ["ROLE_USER"],
  "iat": 1709123456,
  "exp": 1709124356
}
```

### 2. **Blacklist Stored in Redis**
```
Before: In-memory (lost on restart)
After:  Redis (persistent, shared across servers)
```

### 3. **Memory Usage**
```
Before: ~300 bytes per token
After:  ~36 bytes per token (88% reduction)
```

---

## 🧪 Quick Test

```bash
# 1. Login
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -c cookies.txt

# 2. Access protected resource (should work)
curl -X GET http://localhost:9090/api/auth/me -b cookies.txt

# 3. Logout (blacklists token)
curl -X GET http://localhost:9090/api/auth/logout -b cookies.txt

# 4. Try again (should fail with 401)
curl -X GET http://localhost:9090/api/auth/me -b cookies.txt
# Expected: {"error":"Unauthorized","message":"Token has been revoked..."}
```

---

## 🔍 Verify Redis

```bash
# Connect to Redis
docker exec -it redis-cache redis-cli

# Check blacklisted tokens
KEYS blacklist:*

# Check TTL (time remaining)
TTL blacklist:550e8400-e29b-41d4-a716-446655440000

# Exit
exit
```

---

## 📋 Files Changed

1. ✅ `pom.xml` - Added Redis dependency
2. ✅ `application.properties` - Redis config
3. ✅ `docker-compose.dev.yml` - Redis service
4. ✅ `JwtUtil.java` - Token IDs (jti)
5. ✅ `TokenBlacklistService.java` - Redis storage
6. ✅ `RedisConfig.java` - NEW file

---

## 🎯 Benefits

- ✅ Tokens invalidated immediately on logout
- ✅ Works across multiple backend servers
- ✅ Survives server restarts
- ✅ 88% less memory usage
- ✅ Production-ready

---

## 📚 Full Documentation

- **Complete Guide:** `REDIS_IMPLEMENTATION_GUIDE.md`
- **Analysis:** `TOKEN_BLACKLIST_ANALYSIS.md`
- **JWT Guide:** `JWT_TOKEN_INVALIDATION_GUIDE.md`

