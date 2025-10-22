package com.example.demo.controllers;

import com.example.demo.dtos.MediaDto;
import com.example.demo.dtos.PostDto;
import com.example.demo.dtos.Userdto;
import com.example.demo.models.Notification;
import com.example.demo.models.Post;
import com.example.demo.models.Subscription;
import com.example.demo.models.User;
import com.example.demo.models.MediaType;
import com.example.demo.repositories.LikeRepository;
import com.example.demo.services.SseNotificationService;
import com.example.demo.dtos.NotificationDto;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.SubscriptionRepository;
import com.example.demo.repositories.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final SseNotificationService sseNotificationService;
    private final LikeRepository likeRepository;

    public PostController(PostRepository postRepository, UserRepository userRepository,
            SubscriptionRepository subscriptionRepository, NotificationRepository notificationRepository,
            SseNotificationService sseNotificationService, LikeRepository likerepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.sseNotificationService = sseNotificationService;
        this.likeRepository = likerepository;
    }

    // ----------------- CREATE -----------------
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post,
            @AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = principal;
        post.setCreator(currentUser); // Set the logged-in user as creator

        // Auto-determine media type based on file extension if not set
        if (post.getMediaUrl() != null && post.getMediaType() == null) {
            String mediaUrl = post.getMediaUrl();
            String lowerUrl = mediaUrl.toLowerCase();

            if (lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".webm") ||
                    lowerUrl.endsWith(".avi") || lowerUrl.endsWith(".mov") ||
                    lowerUrl.endsWith(".mkv") || lowerUrl.endsWith(".flv")) {
                post.setMediaType(MediaType.VIDEO);
            } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") ||
                    lowerUrl.endsWith(".png") || lowerUrl.endsWith(".gif") ||
                    lowerUrl.endsWith(".webp") || lowerUrl.endsWith(".svg")) {
                post.setMediaType(MediaType.IMAGE);
            }
        }

        Post saved = postRepository.save(post);

        // Create notifications for all followers
        createNotificationsForFollowers(currentUser, saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<PostDto> getAllPosts(@AuthenticationPrincipal User principale) {
        return postRepository.findAll().stream().map(post -> mapToDto(post, principale)).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable Long userId) {
        return postRepository.findByCreator_Id(userId);
    }

    // ----------------- UPDATE -----------------
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id,
            @RequestBody Post postDetails,
            @AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println(postDetails);
        User currentUser = principal;

        Optional<Post> optionalPost = postRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optionalPost.isEmpty()) {
            // Either not found or not owned by current user
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Post post = optionalPost.get();

        // Update all fields that can be modified
        if (postDetails.getTitle() != null) {
            post.setTitle(postDetails.getTitle());
        }
        if (postDetails.getContent() != null) {
            post.setContent(postDetails.getContent());
        }
        if (postDetails.getTags() != null) {
            post.setTags(postDetails.getTags());
        }
        // Handle media URL - allow empty string to clear media
        if (postDetails.getMediaUrl() != null) {
            if (postDetails.getMediaUrl().isEmpty()) {
                post.setMediaUrl(null);
                post.setMediaType(null);
            } else {
                post.setMediaUrl(postDetails.getMediaUrl());
            }
        }
        // Only update media type if mediaUrl is not being cleared
        if (postDetails.getMediaType() != null
                && (postDetails.getMediaUrl() == null || !postDetails.getMediaUrl().isEmpty())) {
            post.setMediaType(postDetails.getMediaType());
        }
        post.setUpdatedAt(java.time.LocalDateTime.now());

        Post updated = postRepository.save(post);
        return ResponseEntity.ok(updated);
    }

    // ----------------- DELETE -----------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id,
            @AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = principal;

        Optional<Post> optionalPost = postRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        postRepository.delete(optionalPost.get());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tags")
    public ResponseEntity<Map<String, Object>> getTags(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Post> posts = postRepository.findAll();

        // Count how many posts have each tag
        Map<String, Long> tagCounts = posts.stream()
                .filter(post -> post.getTags() != null)
                .flatMap(post -> post.getTags().stream().distinct())
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));

        // Sort and take at least 5
        List<Map.Entry<String, Long>> sorted = tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(Math.max(5, tagCounts.size()))
                .collect(Collectors.toList());

        // Convert to array format [{tag, count}, ...]
        List<Map<String, Object>> trendingTags = sorted.stream()
                .map(entry -> Map.<String, Object>of(
                        "tag", entry.getKey(),
                        "count", entry.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("trendingTags", trendingTags);

        return ResponseEntity.ok(response);
    }

    // ----------------- PRIVATE METHODS -----------------
    private void createNotificationsForFollowers(User postCreator, Post post) {
        // Get all followers of the post creator
        List<Subscription> followers = subscriptionRepository.findByFollowed(postCreator);

        // Create a notification for each follower
        for (Subscription subscription : followers) {
            Notification notification = new Notification();
            notification.setCreator(postCreator);
            notification.setReceiver(subscription.getFollower());
            notification.setContent(postCreator.getUsername() + " created a new post: " +
                    (post.getContent().length() > 50 ? post.getContent().substring(0, 50) + "..." : post.getContent()));
            notificationRepository.save(notification);
            NotificationDto dto = new NotificationDto();
            dto.setCreatorName(postCreator.getUsername());
            dto.setTitle(post.getTitle());
            dto.setContent("A new post was published!");
            dto.setCreationDate(notification.getCreatedAt().toString());
            sseNotificationService.sendToUser(subscription.getFollower().getId(), dto);
        }
    }

    private PostDto mapToDto(Post post, User principale) {
        PostDto dto = new PostDto();
        dto.setId(post.getId().toString());
        dto.setAuthor(mapUserToDto(post.getCreator()));
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setExcerpt(
                post.getContent().length() > 100 ? post.getContent().substring(0, 100) + "..." : post.getContent());
        dto.setMedia(post.getMediaUrl() != null
                ? List.of(new MediaDto(post.getMediaType().name(), post.getMediaUrl(), post.getTitle()))
                : List.of());
        dto.setTags(post.getTags());
        dto.setLikes(post.getLikes() != null ? post.getLikes().size() : 0); // Request likes from backend
        dto.setComments(post.getComments() != null ? post.getComments().size() : 0); // Request comments from backend
        dto.setLiked(likeRepository.findByCreator_IdAndPost_Id(principale.getId(), post.getId()).orElse(null) != null); // Set
        dto.setSubscribed(
                subscriptionRepository.findByFollowerAndFollowed(principale, post.getCreator()).orElse(null) != null); // Set
        dto.setCreatedAt(post.getCreatedAt().toString());
        dto.setVisibility("public"); // Or your logic
        return dto;
    }

    private Userdto mapUserToDto(User user) {
        Userdto dto = new Userdto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAvatar(
                user.getImage() != null ? user.getImage() : "https://ui-avatars.com/api/?name=" + user.getUsername());
        dto.setBio(user.getBio() != null ? user.getBio() : "");
        dto.setRole(user.getRole());
        // If you have a way to count subscribers and posts, set them here:
        // dto.setSubscribers(user.getSubscribers() != null ?
        // user.getSubscribers().size() : 0); // Or your logic
        // dto.setPosts(user.getPosts() != null ? user.getPosts().size() : 0); // Or
        // your logic
        return dto;
    }
}
