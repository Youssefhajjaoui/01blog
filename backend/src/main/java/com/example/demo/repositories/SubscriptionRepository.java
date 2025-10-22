package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Subscription;
import com.example.demo.models.User;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // Check if a user is following another user
    boolean existsByFollowerAndFollowed(User follower, User followed);
    
    // Find subscription by follower and followed users
    Optional<Subscription> findByFollowerAndFollowed(User follower, User followed);
    
    // Get all users that a user is following
    List<Subscription> findByFollower(User follower);
    
    // Get all users that follow a specific user
    List<Subscription> findByFollowed(User followed);
    
    // Count how many users a user is following
    long countByFollower(User follower);
    
    // Count how many followers a user has
    long countByFollowed(User followed);
} 