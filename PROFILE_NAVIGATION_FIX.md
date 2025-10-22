# Profile Navigation Fix - Backend Endpoint Implementation

## Problem
When clicking on another user's profile, the application was showing your own profile instead of the selected user's profile. This was because the backend was missing the required endpoints for fetching user profile data.

## Root Cause
The frontend was trying to call `GET /api/users/{userId}` to fetch user profile information, but this endpoint didn't exist in the backend. The UserService method existed but had nowhere to send the request.

## Solution

### 1. Created UserController (Backend)
**File**: `backend/src/main/java/com/example/demo/controllers/UserController.java`

Added two essential endpoints:

#### A. Get User Profile
```java
@GetMapping("/{userId}")
public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId)
```
- Fetches user by ID from database
- Returns user profile with statistics (followers, following, post count)
- Filters out banned users
- Returns 404 if user not found

#### B. Check Follow Status
```java
@GetMapping("/{userId}/is-following")
public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId)
```
- Checks if current user is following the target user
- Returns boolean value
- Requires authentication

### 2. Created UserProfileDto
A data transfer object that includes:
- Basic user info (id, username, email, bio, avatar)
- User role
- Statistics (followerCount, followingCount, postCount)
- Account creation date

### 3. Updated Security Configuration
**File**: `backend/src/main/java/com/example/demo/config/SecurityConfig.java`

Added user endpoints to security configuration:
```java
.requestMatchers("/api/users/**").authenticated()
```
This ensures all user profile endpoints require authentication.

### 4. Updated Frontend UserService
**File**: `frontend/src/app/services/user.service.ts`

Added `withCredentials: true` to getUserProfile method:
```typescript
getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/users/${userId}`, 
        { withCredentials: true })
}
```

### 5. Fixed Server-Side Rendering
**File**: `frontend/src/app/app.routes.server.ts`

Configured dynamic profile route to use Server rendering instead of Prerender:
```typescript
{
  path: 'profile/:userId',
  renderMode: RenderMode.Server
}
```

This prevents build errors for routes with parameters.

## How It Works Now

### Flow When Clicking on Another User's Profile:

1. **User Action**: Click on username/avatar in search results, posts, or comments
2. **Navigation**: Angular router navigates to `/profile/{userId}`
3. **Route Detection**: Profile component detects `userId` parameter
4. **API Call**: Frontend calls `GET /api/users/{userId}` with credentials
5. **Backend Processing**:
   - Validates JWT token
   - Fetches user from database
   - Calculates statistics (followers, following, posts)
   - Returns UserProfileDto
6. **Data Mapping**: Frontend maps UserProfileDto to User model
7. **Follow Check**: Calls `GET /api/users/{userId}/is-following`
8. **UI Update**: Profile component displays other user's data
9. **Button Display**: Shows "Follow" or "Following" button instead of "Edit Profile"

### Flow When Viewing Own Profile:

1. **User Action**: Click profile icon or navigate to `/profile`
2. **No userId**: Route parameter is empty
3. **Own Profile**: Component uses `authService.getCurrentUser()`
4. **UI Update**: Shows "Edit Profile" button
5. **No API Call**: Uses locally cached user data

## API Endpoints

### User Profile Endpoints

#### Get User Profile
- **URL**: `GET /api/users/{userId}`
- **Auth**: Required (JWT token in cookies)
- **Response**:
```json
{
  "id": 123,
  "username": "john_doe",
  "email": "john@example.com",
  "image": "uploads/avatar.jpg",
  "bio": "Software developer",
  "role": "USER",
  "followerCount": 50,
  "followingCount": 30,
  "postCount": 25,
  "createdAt": "2024-01-15T10:30:00"
}
```

#### Check Follow Status
- **URL**: `GET /api/users/{userId}/is-following`
- **Auth**: Required
- **Response**: `true` or `false`

## Testing

### Manual Testing Steps:

1. **Test Own Profile**:
   - Navigate to `/profile`
   - Should see your username, email, stats
   - Should see "Edit Profile" button

2. **Test Other User's Profile**:
   - Search for a user
   - Click on the suggestion
   - Should navigate to `/profile/{userId}`
   - Should see their username, email, stats
   - Should see "Follow" button

3. **Test Follow Functionality**:
   - On another user's profile
   - Click "Follow" button
   - Button should change to "Following"
   - Follower count should increase

4. **Test Post Author Click**:
   - Go to home page
   - Click on a post author's name
   - Should navigate to their profile
   - Should see their posts

5. **Test Back Navigation**:
   - View another user's profile
   - Click back button
   - Navigate to a different user
   - Should load new user's data

## Backend Database Queries

The UserController performs these queries:

1. **Find User by ID**:
   ```sql
   SELECT * FROM users WHERE id = ?
   ```

2. **Count Followers**:
   ```sql
   SELECT COUNT(*) FROM subscriptions WHERE followed_id = ?
   ```

3. **Count Following**:
   ```sql
   SELECT COUNT(*) FROM subscriptions WHERE follower_id = ?
   ```

4. **Count Posts**:
   ```sql
   SELECT COUNT(*) FROM posts WHERE creator_id = ?
   ```

5. **Check Follow Status**:
   ```sql
   SELECT * FROM subscriptions 
   WHERE follower_id = ? AND followed_id = ?
   ```

## Security Considerations

✅ **Authentication Required**: All endpoints require valid JWT token
✅ **Banned User Filtering**: Banned users don't appear in profiles
✅ **User Validation**: Returns 404 for non-existent users
✅ **CORS Configured**: Allows credentials from localhost
✅ **No Sensitive Data**: Passwords never exposed in DTOs

## Performance Optimization

- **Single Query**: UserProfileDto created in one controller call
- **Efficient Counting**: Uses repository count methods (not loading all records)
- **Caching Ready**: DTOs can be cached if needed
- **Lazy Loading**: Only loads data when route changes

## Error Handling

### Backend Errors:
- **User Not Found**: Returns 404
- **Unauthorized**: Returns 401 if not logged in
- **Banned User**: Returns 404 (treated as not found)

### Frontend Error Handling:
```typescript
error: (error) => {
  console.error('Error loading user profile:', error);
  this.loading = false;
  // Redirect to own profile if user not found
  this.router.navigate(['/profile']);
}
```

## Common Issues and Solutions

### Issue: Still seeing own profile
**Solution**: Clear browser cache and restart backend

### Issue: 401 Unauthorized
**Solution**: Check JWT token is being sent in cookies

### Issue: 404 Not Found
**Solution**: Verify backend UserController is deployed

### Issue: Follow button not working
**Solution**: Check SubscriptionController endpoints exist

## Files Modified

### Backend:
1. ✅ `UserController.java` - Created new controller
2. ✅ `SecurityConfig.java` - Added user endpoints to security

### Frontend:
1. ✅ `user.service.ts` - Added withCredentials
2. ✅ `app.routes.server.ts` - Fixed SSR configuration

## Next Steps

### Recommended Enhancements:
1. Add user profile caching
2. Implement profile image upload
3. Add more user statistics
4. Create user activity timeline
5. Add mutual followers display
6. Implement private profiles

## Verification Checklist

Before deploying:
- [ ] Backend compiles without errors
- [ ] Frontend builds successfully
- [ ] Can view own profile
- [ ] Can view other user's profile
- [ ] Follow button works correctly
- [ ] Profile data loads correctly
- [ ] Error handling works
- [ ] Navigation works smoothly
