package com.example.demo.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.User;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.SubscriptionRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final SubscriptionRepository subscriptionRepository;

    public SuggestionController(UserRepository userRepository, 
                              PostRepository postRepository, 
                              SubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Suggestion controller is working!");
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSuggestionDto>> getSuggestedUsers(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        // Get all users except the current user
        List<User> allUsers = userRepository.findAll()
            .stream()
            .filter(user -> !user.getId().equals(currentUser.getId()))
            .collect(Collectors.toList());

        // Get users that the current user is already following
        List<Long> followingIds = subscriptionRepository.findByFollower(currentUser)
            .stream()
            .map(subscription -> subscription.getFollowed().getId())
            .collect(Collectors.toList());

        // Filter out users that the current user is already following
        List<User> notFollowingUsers = allUsers.stream()
            .filter(user -> !followingIds.contains(user.getId()))
            .collect(Collectors.toList());

        // Calculate suggestion scores for each user
        List<UserSuggestionDto> suggestions = notFollowingUsers.stream()
            .map(user -> {
                long followerCount = subscriptionRepository.countByFollowed(user);
                long postCount = postRepository.findByCreator(user).size();
                
                // Calculate suggestion score: followers * 2 + posts * 1
                // This gives more weight to users with many followers
                long suggestionScore = followerCount * 2 + postCount;
                
                return new UserSuggestionDto(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getImage(),
                    user.getBio(),
                    user.getRole().toString(),
                    followerCount,
                    postCount,
                    suggestionScore
                );
            })
            .filter(suggestion -> suggestion.getSuggestionScore() > 0) // Only suggest users with some activity
            .sorted((a, b) -> Long.compare(b.getSuggestionScore(), a.getSuggestionScore())) // Sort by score descending
            .limit(3) // Get top 3 suggestions
            .collect(Collectors.toList());

        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        if (q == null || q.trim().isEmpty() || q.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }

        String query = q.trim();
        
        // Search by username first (more relevant)
        List<User> usernameResults = userRepository.searchByUsername(query);
        
        // Combine results, avoiding duplicates and excluding current user
        List<User> allResults = usernameResults.stream()
            .filter(user -> !user.getId().equals(currentUser.getId()))
            .collect(Collectors.toList());
        
        // Limit to 10 results
        List<User> limitedResults = allResults.stream()
            .limit(10)
            .collect(Collectors.toList());

        return ResponseEntity.ok(limitedResults);
    }

    // DTO for user suggestions
    public static class UserSuggestionDto {
        private Long id;
        private String username;
        private String email;
        private String image;
        private String bio;
        private String role;
        private long followerCount;
        private long postCount;
        private long suggestionScore;

        public UserSuggestionDto(Long id, String username, String email, String image, 
                               String bio, String role, long followerCount, 
                               long postCount, long suggestionScore) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.image = image;
            this.bio = bio;
            this.role = role;
            this.followerCount = followerCount;
            this.postCount = postCount;
            this.suggestionScore = suggestionScore;
        }

        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getImage() { return image; }
        public String getBio() { return bio; }
        public String getRole() { return role; }
        public long getFollowerCount() { return followerCount; }
        public long getPostCount() { return postCount; }
        public long getSuggestionScore() { return suggestionScore; }

        // Setters
        public void setId(Long id) { this.id = id; }
        public void setUsername(String username) { this.username = username; }
        public void setEmail(String email) { this.email = email; }
        public void setImage(String image) { this.image = image; }
        public void setBio(String bio) { this.bio = bio; }
        public void setRole(String role) { this.role = role; }
        public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }
        public void setPostCount(long postCount) { this.postCount = postCount; }
        public void setSuggestionScore(long suggestionScore) { this.suggestionScore = suggestionScore; }
    }
}
