package com.example.demo.controllers;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.User;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.SubscriptionRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final SubscriptionRepository subscriptionRepository;

    public UserController(UserRepository userRepository, 
                         PostRepository postRepository, 
                         SubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId, 
                                                         @AuthenticationPrincipal User currentUser) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        
        // Don't return banned users
        if (user.isBanned()) {
            return ResponseEntity.notFound().build();
        }

        // Get user statistics
        long followerCount = subscriptionRepository.countByFollowed(user);
        long followingCount = subscriptionRepository.countByFollower(user);
        long postCount = postRepository.findByCreator(user).size();

        UserProfileDto profile = new UserProfileDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getImage(),
            user.getBio(),
            user.getRole().toString(),
            followerCount,
            followingCount,
            postCount,
            user.getCreatedAt()
        );

        return ResponseEntity.ok(profile);
    }

    /**
     * Check if current user is following another user
     */
    @GetMapping("/{userId}/is-following")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId, 
                                              @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> targetUserOpt = userRepository.findById(userId);
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User targetUser = targetUserOpt.get();
        boolean isFollowing = subscriptionRepository.findByFollowerAndFollowed(currentUser, targetUser).isPresent();

        return ResponseEntity.ok(isFollowing);
    }

    /**
     * DTO for user profile
     */
    public static class UserProfileDto {
        private Long id;
        private String username;
        private String email;
        private String image;
        private String bio;
        private String role;
        private long followerCount;
        private long followingCount;
        private long postCount;
        private java.time.LocalDateTime createdAt;

        public UserProfileDto(Long id, String username, String email, String image, 
                            String bio, String role, long followerCount, 
                            long followingCount, long postCount, 
                            java.time.LocalDateTime createdAt) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.image = image;
            this.bio = bio;
            this.role = role;
            this.followerCount = followerCount;
            this.followingCount = followingCount;
            this.postCount = postCount;
            this.createdAt = createdAt;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
        
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public long getFollowerCount() { return followerCount; }
        public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }
        
        public long getFollowingCount() { return followingCount; }
        public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }
        
        public long getPostCount() { return postCount; }
        public void setPostCount(long postCount) { this.postCount = postCount; }
        
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}

