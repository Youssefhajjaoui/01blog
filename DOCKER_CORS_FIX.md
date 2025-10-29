# Docker CORS Fix - Complete Solution

## The Problem

When running the application in Docker containers, the frontend was unable to communicate with the gateway due to CORS errors and incorrect API URLs.

### Root Cause
Angular has **Server-Side Rendering (SSR)** enabled. This means:
1. **Initial page load**: Angular runs on the server (frontend Docker container)
2. **After hydration**: Angular runs in the browser (your machine)

The issue: All services were hardcoded to use `http://localhost:8080`, which:
- ✅ Works in browser (client-side): `localhost:8080` points to gateway on host
- ❌ Fails in SSR (server-side): `localhost:8080` points to frontend container itself, not gateway

## The Solution

### 1. Platform-Aware API URLs
Updated services to detect where code is running:

```typescript
// Server-side (SSR in Docker container)
isPlatformServer(platformId) 
  ? 'http://gateway:8080'  // Use Docker service name

// Client-side (browser)
  : 'http://localhost:8080' // Use localhost
```

### 2. CORS Configuration
**Gateway** (`GatewayConfig.java`):
- Added `CorsWebFilter` bean
- Allows all origins with `allowedOriginPattern("*")`
- Enables credentials for cookies
- Exposes `Set-Cookie` header

**Backend** (`SecurityConfig.java`):
- Updated CORS to allow all origin patterns
- Enabled credentials
- Exposed necessary headers

### 3. Gateway Authentication Filter
**Backend** (`GatewayAuthenticationFilter.java`):
- Skips `/api/auth/**` endpoints
- Allows OPTIONS requests (CORS preflight)
- Validates `X-Gateway-Request` header from gateway

## Files Updated

### Frontend
1. ✅ `frontend/src/app/services/auth.service.ts` - Platform-aware API URL
2. ✅ `frontend/src/app/services/user.service.ts` - Platform-aware API URL
3. ✅ `frontend/src/app/services/post.service.ts` - Platform-aware API URL
4. 📄 `frontend/src/environments/environment.ts` - Created
5. 📄 `frontend/src/environments/environment.server.ts` - Created

### Gateway
1. ✅ `gateway/src/main/java/com/example/gateway/config/GatewayConfig.java` - Added CorsWebFilter
2. ✅ `gateway/src/main/resources/application-docker.properties` - Removed conflicting CORS config
3. ✅ `gateway/src/main/java/com/example/gateway/filter/GatewayAuthenticationFilter.java` - Updated

### Backend
1. ✅ `backend/src/main/java/com/example/demo/config/SecurityConfig.java` - Updated CORS
2. ✅ `backend/src/main/java/com/example/demo/config/GatewayAuthenticationFilter.java` - Skip auth endpoints
3. ✅ `backend/src/main/java/com/example/demo/controllers/AuthController.java` - Better error handling

## How It Works Now

### Request Flow (Docker)

```
Browser (localhost:4200)
    ↓ (Client-side JS calls http://localhost:8080)
Gateway Container (port 8080)
    ↓ (Adds X-Gateway-Request: true header)
    ↓ (CorsWebFilter adds CORS headers)
Backend Container (port 9090)
    ↓ (Validates request from gateway)
    ↓ (Returns 200 OK with JWT cookie)
Gateway
    ↓ (Forwards response with CORS headers)
Browser (receives response with cookie)
```

### SSR Flow (Docker)

```
Browser requests page
    ↓
Frontend Container (SSR server)
    ↓ (Server-side code calls http://gateway:8080)
Gateway Container
    ↓
Backend Container
    ↓
Gateway
    ↓
Frontend Container (renders HTML)
    ↓
Browser (receives pre-rendered page)
```

## Testing

### 1. Clear Browser Cache
```bash
# In browser: Ctrl+Shift+Delete → Clear cache
# Or use Incognito mode
```

### 2. Login
```
URL: http://localhost:4200
Username: admin
Password: admin
```

### 3. Check Network Tab
- ✅ Should see successful POST to `http://localhost:8080/api/auth/login`
- ✅ Response should include CORS headers
- ✅ Should set JWT cookie
- ❌ No CORS errors in console

## Troubleshooting

### Still Getting CORS Errors?

1. **Clear browser cache** (most common issue)
2. **Restart all containers**:
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

3. **Check gateway logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs gateway --tail 50
   ```

4. **Test with curl** (bypasses browser):
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Origin: http://localhost:4200" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}' \
     -v
   ```

### Can't Connect to Gateway?

Check containers are running:
```bash
docker-compose -f docker-compose.dev.yml ps
```

All services should be "Up"

## Admin Credentials

```
Username: admin
Password: admin
```

**⚠️ Change these in production!**

Set via environment variables in `docker-compose.dev.yml`:
```yaml
environment:
  - ADMIN_USERNAME=your_username
  - ADMIN_PASSWORD=your_password
```

