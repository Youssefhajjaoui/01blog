# CORS Troubleshooting Guide

## Current CORS Configuration

### Gateway CORS (Java Bean)
- **Location**: `gateway/src/main/java/com/example/gateway/config/GatewayConfig.java`
- **Allowed Origins**: All (`*`)
- **Allowed Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Allowed Headers**: All
- **Credentials**: Enabled
- **Exposed Headers**: Set-Cookie, Authorization, Access-Control-Allow-Origin

### Backend CORS
- **Location**: `backend/src/main/java/com/example/demo/config/SecurityConfig.java`
- **Allowed Origins**: All (`*`)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Credentials**: Enabled

## Testing CORS

### 1. Test Preflight Request (OPTIONS)
```bash
curl -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**Expected headers in response:**
- `Access-Control-Allow-Origin: http://localhost:4200`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS`
- `Access-Control-Allow-Credentials: true`

### 2. Test Actual Login Request
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:4200" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -v
```

**Expected:**
- Status: 200 OK
- `Access-Control-Allow-Origin: http://localhost:4200`
- `Set-Cookie: jwt=...`

## Common CORS Errors

### Error: "No 'Access-Control-Allow-Origin' header"
**Cause**: CORS filter not applied or misconfigured
**Solution**: Verify `CorsWebFilter` bean is loaded in gateway

### Error: "CORS policy: credentials mode is 'include'"
**Cause**: Using wildcard origin (`*`) with credentials
**Solution**: Use `allowedOriginPattern` instead of `allowedOrigins`

### Error: "Preflight request didn't succeed"
**Cause**: OPTIONS request is blocked or returns error
**Solution**: Ensure OPTIONS requests are allowed through all filters

## Debugging Steps

1. **Check Gateway Logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs gateway --tail 100 | grep -i cors
   ```

2. **Check Backend Logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs backend --tail 100 | grep -i cors
   ```

3. **Browser Developer Tools**:
   - Open Network tab
   - Look for preflight OPTIONS request
   - Check response headers for `Access-Control-*` headers

4. **Verify Filter Order**:
   - Gateway: `CorsWebFilter` should run early
   - Backend: CORS configuration should be applied before security filters

## Request Flow

```
Frontend (localhost:4200)
    ↓ (OPTIONS preflight)
Gateway (localhost:8080)
    ↓ (CorsWebFilter adds headers)
Backend (localhost:9090)
    ↓ (Returns 200 OK)
Gateway (adds CORS headers)
    ↓
Frontend (receives response)
```

## Current Admin Credentials

- **Username**: `admin`
- **Password**: `admin`

