package com.example.demo.controllers;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.User;
import com.example.demo.dtos.Userdto;
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
    public ResponseEntity<Userdto> getUserProfile(@PathVariable Long userId, 
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

        Userdto profile = new Userdto();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setAvatar(user.getImage());
        profile.setBio(user.getBio());
        profile.setRole(user.getRole());
        profile.setFollowers((int) followerCount);
        profile.setFollowing((int) followingCount);
        profile.setPosts((int) postCount);

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

    // Removed inner UserProfileDto to avoid duplication; using shared Userdto instead
}

