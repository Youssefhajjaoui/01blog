package com.example.demo.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Subscription;
import com.example.demo.models.User;
import com.example.demo.repositories.SubscriptionRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<String> followUser(@PathVariable Long userId, 
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> currentUserOpt = userRepository.findByUsername(principal.getUsername());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userToFollowOpt = userRepository.findById(userId);
        if (userToFollowOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User currentUser = currentUserOpt.get();
        User userToFollow = userToFollowOpt.get();

        // Check if trying to follow self
        if (currentUser.getId().equals(userToFollow.getId())) {
            return ResponseEntity.badRequest().body("Cannot follow yourself");
        }

        // Check if already following
        if (subscriptionRepository.existsByFollowerAndFollowed(currentUser, userToFollow)) {
            return ResponseEntity.badRequest().body("Already following this user");
        }

        // Create new subscription
        Subscription subscription = new Subscription();
        subscription.setFollower(currentUser);
        subscription.setFollowed(userToFollow);
        subscriptionRepository.save(subscription);

        return ResponseEntity.ok("Successfully followed user");
    }

    @DeleteMapping("/unfollow/{userId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long userId, 
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> currentUserOpt = userRepository.findByUsername(principal.getUsername());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userToUnfollowOpt = userRepository.findById(userId);
        if (userToUnfollowOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User currentUser = currentUserOpt.get();
        User userToUnfollow = userToUnfollowOpt.get();

        Optional<Subscription> subscriptionOpt = subscriptionRepository
                .findByFollowerAndFollowed(currentUser, userToUnfollow);
        
        if (subscriptionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Not following this user");
        }

        subscriptionRepository.delete(subscriptionOpt.get());
        return ResponseEntity.ok("Successfully unfollowed user");
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<Subscription>> getUserFollowers(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Subscription> followers = subscriptionRepository.findByFollowed(userOpt.get());
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<List<Subscription>> getUserFollowing(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Subscription> following = subscriptionRepository.findByFollower(userOpt.get());
        return ResponseEntity.ok(following);
    }

    @GetMapping("/followers/count/{userId}")
    public ResponseEntity<Long> getFollowersCount(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        long count = subscriptionRepository.countByFollowed(userOpt.get());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/following/count/{userId}")
    public ResponseEntity<Long> getFollowingCount(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        long count = subscriptionRepository.countByFollower(userOpt.get());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/is-following/{userId}")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId, 
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> currentUserOpt = userRepository.findByUsername(principal.getUsername());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> targetUserOpt = userRepository.findById(userId);
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean isFollowing = subscriptionRepository.existsByFollowerAndFollowed(
                currentUserOpt.get(), targetUserOpt.get());
        
        return ResponseEntity.ok(isFollowing);
    }
} 