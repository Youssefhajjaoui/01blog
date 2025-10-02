package com.example.demo.controllers;

import com.example.demo.models.Notification;
import com.example.demo.models.Post;
import com.example.demo.models.Subscription;
import com.example.demo.models.User;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.SubscriptionRepository;
import com.example.demo.repositories.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationController notifcontroller;

    public PostController(PostRepository postRepository, UserRepository userRepository,
            SubscriptionRepository subscriptionRepository, NotificationRepository notificationRepository,
            NotificationController notifcontroller) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.notifcontroller = notifcontroller;
    }

    // ----------------- CREATE -----------------
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<User> optionalUser = userRepository.findByUsername(principal.getUsername());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = optionalUser.get();
        post.setCreator(currentUser); // Set the logged-in user as creator
        Post saved = postRepository.save(post);

        // Create notifications for all followers
        createNotificationsForFollowers(currentUser, saved, notifcontroller);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ----------------- READ -----------------
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
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
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<User> optionalCurrentUser = userRepository.findByUsername(principal.getUsername());
        if (optionalCurrentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = optionalCurrentUser.get();

        Optional<Post> optionalPost = postRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optionalPost.isEmpty()) {
            // Either not found or not owned by current user
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Post post = optionalPost.get();

        post.setContent(postDetails.getContent());
        post.setMediaUrl(postDetails.getMediaUrl());
        post.setMediaType(postDetails.getMediaType());
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
        Optional<User> optionalCurrentUser = userRepository.findByUsername(principal.getUsername());
        if (optionalCurrentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = optionalCurrentUser.get();

        Optional<Post> optionalPost = postRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        postRepository.delete(optionalPost.get());
        return ResponseEntity.noContent().build();
    }

    // ----------------- PRIVATE METHODS -----------------
    private void createNotificationsForFollowers(User postCreator, Post post, NotificationController notifcontroller) {
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
            notifcontroller.sendPostNotification(post.getTitle());
        }
    }
}
