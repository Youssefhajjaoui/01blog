# JWT Token Invalidation Guide

## Current Authentication Flow

Your backend uses **stateless JWT authentication** with the following architecture:

### Backend Structure

**Files:**
- `com/example/demo/security/JwtUtil.java` - Token generation/validation
- `com/example/demo/config/JwtAuthFilter.java` - Request filtering
- `com/example/demo/controllers/AuthController.java` - Login/logout endpoints
- `com/example/demo/config/SecurityConfig.java` - Security configuration
- `com/example/demo/models/User.java` - User model

---

## ⚠️ Current Problem

**JWTs are stateless by design** - meaning the server doesn't keep track of valid tokens. This creates a security gap:

### What Happens Now:

1. **Login** → Server generates JWT token (valid for 15 minutes)
2. **Logout** → Server clears client's cookie but **token remains valid**
3. **Stolen Token** → If someone captures the JWT, they can use it until it expires

### Security Issues:

```
User A logs in → Gets Token "abc123"
User A logs out → Cookie cleared in browser
BUT Token "abc123" is still valid until expiration (15 min)

If someone steals "abc123" before logout, they can use it for 15 minutes
```

---

## Solutions for JWT Invalidation

### **Option 1: Token Blacklist (Recommended for your setup)**

Store invalidated tokens in memory or database until they expire.

**Pros:**
- ✅ Simple to implement
- ✅ Works with your current JWT setup
- ✅ Invalidates tokens immediately
- ✅ No changes needed to frontend

**Cons:**
- ⚠️ Need to check blacklist on every request
- ⚠️ Memory/database overhead (minimal if tokens expire in 15 min)

### **Option 2: Redis Token Store**

Use Redis to store active tokens with expiration.

**Pros:**
- ✅ Scales better
- ✅ Built-in expiration handling
- ✅ Can revoke all tokens for a user easily

**Cons:**
- ⚠️ Requires Redis infrastructure
- ⚠️ More complex setup

### **Option 3: Short-lived Tokens + Refresh Tokens**

Issue very short-lived tokens (5 min) with refresh tokens.

**Pros:**
- ✅ Better security if tokens are stolen
- ✅ Can force re-authentication quickly

**Cons:**
- ⚠️ More complex client-side logic
- ⚠️ Frontend changes required

---

## 🔧 Implementation: Token Blacklist (Option 1)

I'll implement the **Token Blacklist** approach below. Here's how it works:

### Architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Request Flow                          │
└─────────────────────────────────────────────────────────┘

1. User logs out → Token added to blacklist
2. User makes request → Filter checks blacklist
3. If token is blacklisted → 401 Unauthorized
4. After token expires (15 min) → Remove from blacklist
```

### Step-by-Step Implementation:

#### **Step 1: Create TokenBlacklist Service**

```java
// backend/src/main/java/com/example/demo/security/TokenBlacklistService.java

package com.example.demo.security;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Date;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {
    
    // Map to store blacklisted tokens: token -> expiration time
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    
    /**
     * Add a token to the blacklist
     */
    public void blacklistToken(String token) {
        // Extract expiration from token and store it
        try {
            Claims claims = jwtUtil.extractClaims(token);
            long expiration = claims.getExpiration().getTime();
            blacklistedTokens.put(token, expiration);
        } catch (Exception e) {
            // If we can't extract expiration, store with default expiration
            blacklistedTokens.put(token, System.currentTimeMillis() + 900000); // 15 min default
        }
    }
    
    /**
     * Check if a token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        Long expiration = blacklistedTokens.get(token);
        if (expiration == null) {
            return false; // Not blacklisted
        }
        
        // Check if token has expired
        if (expiration < System.currentTimeMillis()) {
            blacklistedTokens.remove(token); // Clean up
            return false; // Token is expired, remove from blacklist
        }
        
        return true; // Token is blacklisted and still valid
    }
    
    /**
     * Clean up expired tokens from blacklist every minute
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    public void cleanExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue() < now);
    }
    
    // Need to inject JwtUtil
    private final JwtUtil jwtUtil;
    
    public TokenBlacklistService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
}
```

#### **Step 2: Update JwtUtil.java**

```java
// Add this method to your JwtUtil class

public Claims extractClaims(String token) {
    try {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    } catch (ExpiredJwtException e) {
        throw e; // Re-throw so we can handle it properly
    } catch (MalformedJwtException | SignatureException | UnsupportedJwtException
            | IllegalArgumentException e) {
        throw new RuntimeException("Invalid JWT token", e);
    }
}
```

#### **Step 3: Update JwtAuthFilter.java**

```java
// In doFilterInternal method, add blacklist check after extracting token:

@Override
protected void doFilterInternal(HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {
    
    // ... existing code ...
    
    String token = null;
    for (Cookie cookie : cookies) {
        if ("jwt".equals(cookie.getName())) {
            token = cookie.getValue();
            break;
        }
    }

    if (token == null || token.isEmpty()) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"error\":\"Unauthorized\",\"message\":\"Full authentication is required to access this resource\"}");
        return;
    }
    
    // ✅ NEW: Check if token is blacklisted
    if (tokenBlacklistService.isTokenBlacklisted(token)) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"error\":\"Unauthorized\",\"message\":\"Token has been revoked\"}");
        return;
    }
    
    String username = jwtUtil.extractUsername(token);
    
    // ... rest of existing code ...
}
```

#### **Step 4: Update AuthController.java**

```java
// Modify logout method to blacklist the token:

@GetMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
    try {
        // Extract token from request
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        // ✅ NEW: Blacklist the token
        if (token != null && !token.isEmpty()) {
            tokenBlacklistService.blacklistToken(token);
        }
        
        // Clear the JWT cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // Expire immediately
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new AuthResponseDto("Logged out successfully"));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponseDto("Logout failed: " + e.getMessage()));
    }
}
```

#### **Step 5: Enable Scheduling**

```java
// Add to your main Application.java or create a config

@SpringBootApplication
@EnableScheduling  // Add this annotation
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## 📊 How It Works After Implementation

### Timeline Example:

```
T=0:00  User logs in → Token created (expires at T=15:00)
T=5:00  User logs out → Token BLACKLISTED
T=6:00  Attacker uses stolen token → ❌ 401 "Token has been revoked"
T=15:00 Token expires → Removed from blacklist (cleanup)
```

### What Happens:

1. **Login** → Generate JWT, store expiration info
2. **Logout** → Add token to blacklist, clear cookie
3. **Request** → Check if token is in blacklist
4. **Cleanup** → Every minute, remove expired tokens from memory

---

## 🎯 Alternative: Database-Backed Blacklist

If you want persistence across server restarts:

```java
@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {
    @Id
    private String tokenId;
    
    @Column(nullable = false)
    private Long expiration;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    // Hash of token for privacy
    public static String hashToken(String token) {
        return DigestUtils.sha256Hex(token);
    }
}
```

But for your 15-minute expiration, **memory-based blacklist is sufficient**.

---

## 🚀 Quick Summary

**Problem:** JWT tokens remain valid after logout

**Solution:** Token blacklist that stores invalidated tokens until expiration

**Result:** Tokens become immediately useless after logout

Would you like me to implement this for you?

