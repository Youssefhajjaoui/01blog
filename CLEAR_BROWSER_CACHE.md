# Clear Browser Cache for CORS Testing

## Why Clear Cache?

Browsers cache CORS preflight responses. Even after fixing CORS configuration on the server, the browser might still use the old cached response that was failing.

## How to Clear Cache

### Option 1: Hard Refresh (Recommended)
1. Open your browser with the app at `http://localhost:4200`
2. Open DevTools (F12)
3. **Right-click** the refresh button
4. Select **"Empty Cache and Hard Reload"**

### Option 2: Clear Browser Data
**Chrome/Edge:**
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "Cached images and files"
3. Select "Time range: Last hour"
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "Cache"
3. Select "Time range to clear: Last hour"
4. Click "Clear Now"

### Option 3: Use Incognito/Private Window
1. Open a new Incognito/Private window (`Ctrl+Shift+N` or `Cmd+Shift+N`)
2. Navigate to `http://localhost:4200`
3. Try logging in

### Option 4: Disable Cache in DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **"Disable cache"** checkbox
4. Keep DevTools open while testing
5. Refresh the page

## After Clearing Cache

1. Navigate to `http://localhost:4200`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try logging in with:
   - Username: `admin`
   - Password: `admin`
5. Check the network requests for:
   - OPTIONS request (preflight) - should have CORS headers
   - POST request to `/api/auth/login` - should succeed

## Verify CORS Headers

In the Network tab, click on the login request and check Response Headers:
- ✅ `Access-Control-Allow-Origin: http://localhost:4200`
- ✅ `Access-Control-Allow-Credentials: true`
- ✅ `Set-Cookie: jwt=...`

## Still Getting CORS Error?

If CORS error persists after clearing cache:

1. **Check gateway is running**:
   ```bash
   docker-compose -f docker-compose.dev.yml ps gateway
   ```

2. **Check gateway logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs gateway --tail 50
   ```

3. **Test with curl** (bypasses browser cache):
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Origin: http://localhost:4200" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}' \
     -v
   ```

4. **Restart all services**:
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

