package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Notification;
import com.example.demo.models.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for a specific user
    List<Notification> findByReceiver(User receiver);
    
    // Find all notifications for a specific user ordered by creation date descending
    @Query("SELECT n FROM Notification n WHERE n.receiver = :receiver ORDER BY n.createdAt DESC")
    List<Notification> findByReceiverOrderByCreatedAtDesc(User receiver);
    
    // Find unread notifications for a specific user
    List<Notification> findByReceiverAndReadFalse(User receiver);
    
    // Count unread notifications for a specific user
    long countByReceiverAndReadFalse(User receiver);
    
    // Find notifications by creator
    List<Notification> findByCreator(User creator);
} 