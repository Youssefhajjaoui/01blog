# Gateway Architecture - Step by Step Explanation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Request Flow](#request-flow)
4. [Rate Limiting System](#rate-limiting-system)
5. [Security Layers](#security-layers)
6. [How to Limit Users](#how-to-limit-users)

---

## Overview

Your application uses a **2-layer security and rate limiting architecture**:

```
Frontend (Port 4200)
    ↓
API Gateway (Port 8080) ← Rate Limiting + CORS Validation
    ↓
Backend (Port 9090) ← JWT Authentication + Business Logic
```

**Key Benefits:**
- ✅ Rate limiting happens **before** backend, saving resources
- ✅ Backend is protected from direct external access
- ✅ Distributed rate limiting via Redis (works across multiple instances)
- ✅ Per-user and per-IP rate limiting

---

## Architecture Layers

### **Layer 1: API Gateway (Spring Cloud Gateway)**

**Location**: `gateway/` directory  
**Port**: 8080  
**Purpose**: Entry point for all client requests

**Components:**
1. **GatewayConfig** (`GatewayConfig.java`)
   - Defines routing rules
   - Configures CORS
   - Routes all requests to backend

2. **GatewayAuthenticationFilter** (`GatewayAuthenticationFilter.java`)
   - Adds `X-Gateway-Request: true` header to backend requests
   - Helps backend identify gateway traffic

3. **UserKeyResolver** (`UserKeyResolver.java`)
   - Extracts user from JWT token for rate limiting
   - Falls back to IP address if no authentication

4. **IpKeyResolver** (`IpKeyResolver.java`)
   - Alternative resolver based on IP only

**Current Status**: Rate limiting configuration exists but routes don't use it yet

---

### **Layer 2: Backend (Spring Boot Application)**

**Location**: `backend/` directory  
**Port**: 9090 (internal only, not exposed)  
**Purpose**: Business logic and authentication

**Components:**

1. **GatewayAuthenticationFilter** (`config/GatewayAuthenticationFilter.java`)
   - **FIRST LINE OF DEFENSE**
   - Validates request comes from gateway or allowed origin
   - Checks CORS Origin header
   - Allows gateway requests (X-Gateway-Request header)
   - Allows localhost/internal network (development)
   - **Rejects direct external access**

2. **JwtAuthFilter** (`config/JwtAuthFilter.java`)
   - **SECOND LINE OF DEFENSE**
   - Validates JWT tokens from cookies
   - Checks token blacklist
   - Sets Spring Security context

3. **SecurityConfig** (`config/SecurityConfig.java`)
   - **THIRD LINE OF DEFENSE**
   - Defines endpoint permissions
   - Configures which endpoints require authentication
   - Sets up CORS, headers, exception handling

4. **Controllers** (Business Logic)
   - Handle actual API requests
   - Use `@AuthenticationPrincipal` to get current user

---

## Request Flow - Step by Step

### **Example: User Logs In**

```
1. Frontend sends POST /api/auth/login
   └─> Destination: http://localhost:8080 (Gateway)

2. GATEWAY LAYER (Port 8080)
   ├─> GatewayAuthenticationFilter adds X-Gateway-Request: true
   ├─> CORS validation (if browser)
   ├─> Routes request to backend
   └─> Forwards to: http://backend:9090/api/auth/login

3. BACKEND LAYER (Port 9090)
   ├─> GatewayAuthenticationFilter (Backend)
   │   ├─> Checks: gateway.enabled = true?
   │   ├─> ✅ Sees X-Gateway-Request: true header → ALLOW
   │   └─> If no header: checks CORS Origin → ALLOW if in allowedOrigins
   │
   ├─> JwtAuthFilter
   │   ├─> Path is /api/auth/** → SKIP (permitAll)
   │   └─> Continue to controller
   │
   ├─> SecurityConfig
   │   ├─> Path is /api/auth/** → permitAll ✅
   │   └─> Request passes
   │
   └─> AuthController.login()
       ├─> Validates credentials
       ├─> Generates JWT token
       └─> Returns response

4. Response flows back
   Backend → Gateway → Frontend
```

### **Example: Authenticated Request (Get User Profile)**

```
1. Frontend sends GET /api/users/{id}
   ├─> Includes JWT cookie (from login)

2. GATEWAY LAYER
   ├─> GatewayAuthenticationFilter adds X-Gateway-Request header
   └─> Forwards to backend

3. BACKEND LAYER
   ├─> GatewayAuthenticationFilter
   │   └─> ✅ X-Gateway-Request present → ALLOW
   │
   ├─> JwtAuthFilter
   │   ├─> Extracts JWT from cookie
   │   ├─> Validates token signature
   │   ├─> Checks token blacklist
   │   ├─> Loads user from database
   │   └─> Sets SecurityContext (user is now authenticated)
   │
   ├─> SecurityConfig
   │   ├─> Path is /api/users/** → requires authenticated ✅
   │   └─> User is authenticated → ALLOW
   │
   └─> UserController.getUser()
       └─> Returns user data
```

### **Example: Direct Access (Blocked)**

```
1. Attacker tries: GET http://backend:9090/api/users/123
   └─> Bypassing gateway (direct access)

2. BACKEND LAYER
   ├─> GatewayAuthenticationFilter
   │   ├─> gateway.enabled = true
   │   ├─> No X-Gateway-Request header ❌
   │   ├─> Origin header not in allowedOrigins ❌
   │   ├─> Remote address is external (not localhost) ❌
   │   └─> ❌ BLOCKED! Returns 403 Forbidden
   │
   └─> Request NEVER reaches controllers
```

---

## Rate Limiting System

### **Current Implementation Status**

**⚠️ Note**: Rate limiting configuration exists in `application.properties` but routes are not yet configured to use it.

### **How Rate Limiting Works (When Enabled)**

The gateway uses **Token Bucket Algorithm** with Redis:

```
User/IP → Has a "bucket" of tokens
├─> Tokens refill at replenishRate per second
├─> Bucket can hold max burstCapacity tokens
├─> Each request consumes requestedTokens (usually 1)
└─> If bucket empty → HTTP 429 (Too Many Requests)
```

**Rate Limit Keys:**
- **Authenticated users**: `user:username` (from JWT token)
- **Unauthenticated**: `ip:192.168.1.1` (from client IP)

### **Configuration (application.properties)**

```properties
# Auth endpoints - strict limits (brute force protection)
ratelimit.auth.replenishRate=5        # 5 tokens/second
ratelimit.auth.burstCapacity=10       # Max 10 tokens (allows 10 quick requests)

# API endpoints - moderate limits
ratelimit.api.replenishRate=50        # 50 tokens/second
ratelimit.api.burstCapacity=100        # Max 100 tokens

# Public endpoints - balanced limits
ratelimit.public.replenishRate=20     # 20 tokens/second
ratelimit.public.burstCapacity=40     # Max 40 tokens
```

---

## Security Layers

### **Layer 1: GatewayAuthenticationFilter (Backend)**

**File**: `backend/src/main/java/com/example/demo/config/GatewayAuthenticationFilter.java`

**How it works:**

```java
1. Check if gateway.enabled = false?
   └─> If disabled → ALLOW ALL (development mode)

2. Check for X-Gateway-Request: true header
   └─> If present → ALLOW (request from gateway)

3. Check CORS Origin header
   ├─> Parse allowedOrigins (comma-separated)
   ├─> Support wildcards (http://localhost:*)
   └─> If origin matches → ALLOW

4. Check if internal/localhost request
   ├─> Remote address starts with 127., 172., localhost, ::1
   ├─> Or Host header contains localhost/gateway/backend
   └─> If yes → ALLOW (development/internal)

5. REJECT with 403 Forbidden
   └─> Message: "Direct access to backend is not allowed"
```

**Skipped for:**
- `/actuator/**` (health checks)
- `OPTIONS` requests (CORS preflight)
- `/api/auth/**` (auth endpoints - but still validated by Spring Security)

---

### **Layer 2: JwtAuthFilter**

**File**: `backend/src/main/java/com/example/demo/config/JwtAuthFilter.java`

**How it works:**

```java
1. Skip if path is /api/auth/** or /error
   └─> Continue to next filter

2. Extract JWT from cookie named "jwt"
   └─> If no cookie → Let Spring Security decide

3. Check token blacklist (Redis)
   └─> If blacklisted → 401 Unauthorized

4. Validate token
   ├─> Extract username
   ├─> Load user from database
   ├─> Verify token signature and expiration
   └─> If valid → Set SecurityContext (user authenticated)

5. Continue filter chain
```

---

### **Layer 3: SecurityConfig**

**File**: `backend/src/main/java/com/example/demo/config/SecurityConfig.java`

**How it works:**

```java
1. Define endpoint permissions:
   ├─> /api/auth/** → permitAll
   ├─> GET /posts/** → permitAll
   ├─> POST /posts/** → authenticated
   ├─> /api/admin/** → hasRole("ADMIN")
   └─> everything else → authenticated

2. Configure filters:
   ├─> GatewayAuthenticationFilter (runs FIRST)
   ├─> JwtAuthFilter (runs SECOND)
   └─> Spring Security authorization (runs LAST)

3. Handle exceptions:
   ├─> 401 if not authenticated
   └─> 403 if authenticated but insufficient permissions
```

---

## How to Limit Users

### **Method 1: Rate Limiting in Gateway (Recommended)**

**Step 1**: Enable rate limiting on specific routes in `GatewayConfig.java`:

```java
@Bean
public RouteLocator customRouteLocator(RouteLocatorBuilder builder, 
                                       RedisRateLimiter redisRateLimiter,
                                       UserKeyResolver userKeyResolver) {
    return builder.routes()
        // Auth endpoints - strict rate limiting
        .route("auth_route", r -> r
            .path("/api/auth/**")
            .filters(f -> f
                .requestRateLimiter(config -> {
                    config.setRateLimiter(redisRateLimiter);
                    config.setKeyResolver(userKeyResolver);
                    config.setDenyEmptyKey(true);
                    config.setEmptyKeyStatus("FORBIDDEN");
                })
                .setRequestSize(10240) // Limit request size
            )
            .uri(backendUrl))
        
        // API endpoints - moderate rate limiting
        .route("api_route", r -> r
            .path("/api/users/**", "/api/posts/**", "/api/files/**")
            .filters(f -> f
                .requestRateLimiter(config -> {
                    config.setRateLimiter(redisRateLimiter);
                    config.setKeyResolver(userKeyResolver);
                    config.setDenyEmptyKey(true);
                })
            )
            .uri(backendUrl))
        
        // Public endpoints
        .route("public_route", r -> r
            .path("/posts/**")
            .filters(f -> f
                .requestRateLimiter(config -> {
                    config.setRateLimiter(redisRateLimiter);
                    config.setKeyResolver(new IpKeyResolver());
                })
            )
            .uri(backendUrl))
        
        // Default route
        .route("default_route", r -> r
            .path("/**")
            .filters(f -> f
                .requestRateLimiter(config -> {
                    config.setRateLimiter(redisRateLimiter);
                    config.setKeyResolver(userKeyResolver);
                })
            )
            .uri(backendUrl))
        .build();
}
```

**Step 2**: Configure `RedisRateLimiter` bean in `GatewayConfig.java`:

```java
@Bean
public RedisRateLimiter redisRateLimiter(ReactiveRedisTemplate<String, String> redisTemplate) {
    // Default rate limiter
    return new RedisRateLimiter(
        100,  // replenishRate (tokens/second)
        150,  // burstCapacity (max tokens)
        1     // requestedTokens (tokens per request)
    );
}

@Bean
@Qualifier("authRateLimiter")
public RedisRateLimiter authRateLimiter(ReactiveRedisTemplate<String, String> redisTemplate) {
    // Stricter for auth endpoints
    return new RedisRateLimiter(5, 10, 1);
}

@Bean
@Qualifier("apiRateLimiter")
public RedisRateLimiter apiRateLimiter(ReactiveRedisTemplate<String, String> redisTemplate) {
    // Moderate for API endpoints
    return new RedisRateLimiter(50, 100, 1);
}
```

**Step 3**: Configure rate limits in `application.properties`:

```properties
# Per-user rate limits
ratelimit.auth.replenishRate=5      # 5 requests/second per user
ratelimit.auth.burstCapacity=10     # Max 10 burst requests

ratelimit.api.replenishRate=50      # 50 requests/second per user
ratelimit.api.burstCapacity=100     # Max 100 burst requests
```

---

### **Method 2: Limit Specific Users (Backend)**

**Step 1**: Add user rate limiting service:

```java
@Service
public class UserRateLimitService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean isUserRateLimited(String username, int limit, int windowSeconds) {
        String key = "user_rate_limit:" + username;
        String count = redisTemplate.opsForValue().get(key);
        
        if (count == null) {
            redisTemplate.opsForValue().set(key, "1", windowSeconds, TimeUnit.SECONDS);
            return false;
        }
        
        int currentCount = Integer.parseInt(count);
        if (currentCount >= limit) {
            return true; // Rate limited
        }
        
        redisTemplate.opsForValue().increment(key);
        return false;
    }
}
```

**Step 2**: Use in controller:

```java
@PostMapping("/api/posts")
public ResponseEntity<?> createPost(@RequestBody PostRequest request,
                                   @AuthenticationPrincipal User user,
                                   UserRateLimitService rateLimitService) {
    // Check if user exceeded rate limit
    if (rateLimitService.isUserRateLimited(user.getUsername(), 10, 60)) {
        return ResponseEntity.status(429)
            .body(Map.of("error", "Too many requests. Please wait 1 minute."));
    }
    
    // Process request
    // ...
}
```

---

### **Method 3: Limit by User Role**

**Modify SecurityConfig** to add custom rate limiting per role:

```java
@Component
public class RoleBasedRateLimitFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            
            // Different limits for different roles
            int limit = switch (user.getRole()) {
                case "ADMIN" -> 1000;  // Admins have higher limits
                case "USER" -> 100;   // Regular users
                default -> 10;         // Default/restricted
            };
            
            // Check rate limit
            if (isRateLimited(user.getUsername(), limit)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

### **Method 4: Block Specific Users**

**Add user blocking service:**

```java
@Service
public class UserBlockingService {
    
    @Autowired
    private UserRepository userRepository;
    
    public void blockUser(String username, int hours) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException(username));
        
        LocalDateTime banEnd = LocalDateTime.now().plusHours(hours);
        user.setBanEnd(banEnd);
        userRepository.save(user);
    }
    
    public boolean isUserBlocked(String username) {
        return userRepository.findByUsername(username)
            .map(user -> {
                if (user.getBanEnd() == null) return false;
                return user.getBanEnd().isAfter(LocalDateTime.now());
            })
            .orElse(false);
    }
}
```

**Check in JwtAuthFilter:**

```java
// In JwtAuthFilter.doFilterInternal()
if (optionalUser.isPresent()) {
    User user = optionalUser.get();
    
    // Check if user is banned/blocked
    if (user.getBanEnd() != null && 
        user.getBanEnd().isAfter(LocalDateTime.now())) {
        response.setStatus(403);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"error\":\"Account is blocked until " + 
            user.getBanEnd() + "\"}"
        );
        return;
    }
    
    // Continue with validation...
}
```

---

### **Method 5: IP-based Blocking**

**Add to GatewayAuthenticationFilter:**

```java
@Value("${blocked.ips:}")
private String blockedIps;

private List<String> getBlockedIps() {
    return Arrays.asList(blockedIps.split(","))
        .stream()
        .map(String::trim)
        .filter(ip -> !ip.isEmpty())
        .collect(Collectors.toList());
}

@Override
protected void doFilterInternal(...) {
    String clientIp = getClientIp(request);
    
    if (getBlockedIps().contains(clientIp)) {
        response.setStatus(403);
        response.getWriter().write("{\"error\":\"IP blocked\"}");
        return;
    }
    
    // Continue with existing logic...
}
```

---

## Summary: How to Limit Users

### **Quick Reference:**

1. **Gateway Rate Limiting** (Best for all users)
   - Configure routes in `GatewayConfig.java`
   - Set limits in `application.properties`
   - Works automatically for all users/IPs

2. **Per-User Limits** (Custom limits)
   - Use `UserRateLimitService` in controllers
   - Check before processing requests

3. **Role-Based Limits** (Different limits per role)
   - Create `RoleBasedRateLimitFilter`
   - Check in filter before controller

4. **User Blocking** (Temporary bans)
   - Use `User` entity's `banEnd` field
   - Check in `JwtAuthFilter`

5. **IP Blocking** (Block malicious IPs)
   - Add to `GatewayAuthenticationFilter`
   - Reject requests from blocked IPs

---

## Testing Your Limits

### **Test Rate Limiting:**

```bash
# Make 20 quick requests
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done

# Should see HTTP 429 after limit is reached
```

### **Check Rate Limit Status:**

```bash
# Connect to Redis
docker exec -it redis redis-cli

# View rate limit keys
KEYS request_rate_limiter:*

# Check specific user's rate limit
GET request_rate_limiter:user:username.tokens
TTL request_rate_limiter:user:username.tokens
```

---

## Next Steps

1. ✅ **Enable rate limiting in GatewayConfig** - Add rate limiters to routes
2. ✅ **Adjust limits in application.properties** - Based on your needs
3. ✅ **Add user blocking** - If needed for moderation
4. ✅ **Monitor Redis** - Check rate limit keys
5. ✅ **Test with load testing** - Verify limits work correctly

---

**Questions? Issues?** Check the logs:
- Gateway: `docker logs api-gateway`
- Backend: `docker logs backend`
- Redis: `docker exec -it redis redis-cli`

