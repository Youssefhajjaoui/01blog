package com.example.demo.examples;

import com.example.demo.ratelimit.RateLimit;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

/**
 * Example showing how to add rate limiting to your existing controllers.
 * 
 * Simply add the @RateLimit annotation to any controller method!
 */
@RestController
@RequestMapping("/api/examples")
public class RateLimitUsageExamples {
    
    /**
     * EXAMPLE 1: Protect authentication endpoints from brute force
     * 
     * Add this to your AuthController login method:
     */
    @RateLimit(
        limit = 5,                           // 5 attempts
        duration = 1,                        // per 1 minute
        unit = TimeUnit.MINUTES,
        keyType = RateLimit.KeyType.IP,     // per IP address
        message = "Too many login attempts. Please wait before trying again."
    )
    @PostMapping("/login-example")
    public ResponseEntity<?> loginExample() {
        // Your existing login logic
        return ResponseEntity.ok("Login successful");
    }
    
    /**
     * EXAMPLE 2: Protect signup from spam
     * 
     * Add this to your AuthController signup method:
     */
    @RateLimit(
        limit = 3,                           // 3 signups
        duration = 1,                        // per hour
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.IP,     // per IP
        message = "Too many signup attempts. Please try again later."
    )
    @PostMapping("/signup-example")
    public ResponseEntity<?> signupExample() {
        // Your existing signup logic
        return ResponseEntity.ok("Signup successful");
    }
    
    /**
     * EXAMPLE 3: Limit post creation per user
     * 
     * Add this to your PostController createPost method:
     */
    @RateLimit(
        limit = 10,                          // 10 posts
        duration = 1,                        // per hour
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.USER    // per authenticated user
    )
    @PostMapping("/posts-example")
    public ResponseEntity<?> createPostExample() {
        // Your existing post creation logic
        return ResponseEntity.ok("Post created");
    }
    
    /**
     * EXAMPLE 4: Limit comments to prevent spam
     * 
     * Add this to your CommentController:
     */
    @RateLimit(
        limit = 30,                          // 30 comments
        duration = 1,                        // per hour
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.USER
    )
    @PostMapping("/comments-example")
    public ResponseEntity<?> createCommentExample() {
        // Your existing comment creation logic
        return ResponseEntity.ok("Comment created");
    }
    
    /**
     * EXAMPLE 5: Rate limit file uploads
     * 
     * Add this to your FileController:
     */
    @RateLimit(
        limit = 20,                          // 20 uploads
        duration = 1,                        // per hour
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.USER
    )
    @PostMapping("/upload-example")
    public ResponseEntity<?> uploadFileExample() {
        // Your existing file upload logic
        return ResponseEntity.ok("File uploaded");
    }
    
    /**
     * EXAMPLE 6: Global rate limit for expensive operations
     * 
     * Limits total requests across all users
     */
    @RateLimit(
        limit = 1000,                        // 1000 requests total
        duration = 1,                        // per hour
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.GLOBAL  // all users combined
    )
    @GetMapping("/expensive-operation-example")
    public ResponseEntity<?> expensiveOperationExample() {
        // Your expensive operation
        return ResponseEntity.ok("Operation completed");
    }
    
    /**
     * EXAMPLE 7: Multiple rate limits (create a custom method)
     * 
     * For more complex scenarios, combine with programmatic checks
     */
    @RateLimit(
        limit = 100,                         // 100 per hour
        duration = 1,
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.USER
    )
    @PostMapping("/multi-rate-limit-example")
    public ResponseEntity<?> multiRateLimitExample() {
        // The annotation handles the per-user hourly limit
        // You can add additional custom checks in the method body if needed
        return ResponseEntity.ok("Success");
    }
    
    /**
     * EXAMPLE 8: Very strict rate limit for critical operations
     * 
     * Add this to password reset or sensitive operations:
     */
    @RateLimit(
        limit = 3,                           // Only 3 attempts
        duration = 24,                       // per 24 hours
        unit = TimeUnit.HOURS,
        keyType = RateLimit.KeyType.USER,
        message = "You have exceeded the maximum number of password reset attempts. Please try again tomorrow."
    )
    @PostMapping("/password-reset-example")
    public ResponseEntity<?> passwordResetExample() {
        // Your password reset logic
        return ResponseEntity.ok("Password reset email sent");
    }
}

/**
 * HOW TO ADD TO YOUR EXISTING CONTROLLERS:
 * ==========================================
 * 
 * 1. Import the annotation:
 *    import com.example.demo.ratelimit.RateLimit;
 *    import java.util.concurrent.TimeUnit;
 * 
 * 2. Add the annotation to your method:
 * 
 *    @RateLimit(limit = 10, duration = 1, unit = TimeUnit.MINUTES)
 *    @PostMapping("/your-endpoint")
 *    public ResponseEntity<?> yourMethod() {
 *        // Your existing code remains unchanged!
 *    }
 * 
 * That's it! The rate limiting is handled automatically.
 * 
 * 
 * RECOMMENDED SETTINGS FOR YOUR BLOG APP:
 * =======================================
 * 
 * AuthController.login():
 *   @RateLimit(limit = 5, duration = 1, unit = TimeUnit.MINUTES, keyType = RateLimit.KeyType.IP)
 * 
 * AuthController.signup():
 *   @RateLimit(limit = 3, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.IP)
 * 
 * PostController.createPost():
 *   @RateLimit(limit = 10, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 * 
 * PostController.updatePost():
 *   @RateLimit(limit = 20, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 * 
 * PostController.deletePost():
 *   @RateLimit(limit = 10, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 * 
 * CommentController.createComment():
 *   @RateLimit(limit = 30, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 * 
 * LikeController.toggleLike():
 *   @RateLimit(limit = 100, duration = 1, unit = TimeUnit.MINUTES, keyType = RateLimit.KeyType.USER)
 * 
 * FileController.upload():
 *   @RateLimit(limit = 20, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 * 
 * ReportController.createReport():
 *   @RateLimit(limit = 5, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 * 
 * UserController.updateProfile():
 *   @RateLimit(limit = 10, duration = 1, unit = TimeUnit.HOURS, keyType = RateLimit.KeyType.USER)
 */

