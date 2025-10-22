# Search Endpoint Test Guide

## Backend Endpoints Added

### 1. User Search Endpoint
- **URL**: `GET /api/suggestions/search?q={query}`
- **Authentication**: Required (JWT token in cookies)
- **Parameters**: 
  - `q` (required): Search query (minimum 2 characters)
- **Response**: Array of User objects

### 2. User Suggestions Endpoint (existing)
- **URL**: `GET /api/suggestions/users`
- **Authentication**: Required
- **Response**: Array of UserSuggestionDto objects

## Security Configuration Updated
- Added `/api/suggestions/search` to authenticated endpoints
- Added `/api/suggestions/users` to authenticated endpoints

## Frontend Integration
- Updated `UserService.searchUsers()` to use correct endpoint with credentials
- Search suggestions service uses the updated UserService

## Testing the Search Functionality

### 1. Backend Test (with authentication)
```bash
# First, login to get JWT token
curl -X POST "http://localhost:9090/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}' \
  -c cookies.txt

# Then test search endpoint
curl -X GET "http://localhost:9090/api/suggestions/search?q=test" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### 2. Frontend Test
1. Start the frontend application
2. Login to the application
3. Type in the search bar (minimum 2 characters)
4. Should see user suggestions appear in dropdown
5. Click on a suggestion to navigate to user profile

## Authentication Error Fix
The "Full authentication is required" error occurs because:
1. User needs to be logged in with valid JWT token
2. JWT token must be sent in cookies (not headers)
3. Backend validates the token and extracts user information

## Repository Changes
- Added search methods to UserRepository:
  - `searchByUsername(String query)`
  - `searchByEmail(String query)`
- Both methods filter out banned users
- Case-insensitive search with LIKE queries

## Controller Changes
- Added `searchUsers()` method to SuggestionController
- Combines username and email search results
- Excludes current user from results
- Limits results to 10 users
- Requires authentication
