package com.example.demo.controllers;

import com.example.demo.dtos.NotificationDto;
import com.example.demo.models.Notification;
import com.example.demo.models.User;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all notifications for the current user
     */
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Notification> notifications = notificationRepository.findByReceiverOrderByCreatedAtDesc(currentUser);
        List<NotificationDto> notificationDtos = notifications.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(notificationDtos);
    }

    /**
     * Get unread notifications count for the current user
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long unreadCount = notificationRepository.countByReceiverAndReadFalse(currentUser);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", unreadCount);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark a specific notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notificationOpt.get();
        
        // Check if the notification belongs to the current user
        if (!notification.getReceiver().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok().build();
    }

    /**
     * Mark all notifications as read for the current user
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Notification> unreadNotifications = notificationRepository.findByReceiverAndReadFalse(currentUser);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);

        return ResponseEntity.ok().build();
    }

    /**
     * Delete a specific notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notificationOpt.get();
        
        // Check if the notification belongs to the current user
        if (!notification.getReceiver().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        notificationRepository.delete(notification);

        return ResponseEntity.ok().build();
    }

    /**
     * Delete all notifications for the current user
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotifications(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Notification> userNotifications = notificationRepository.findByReceiver(currentUser);
        notificationRepository.deleteAll(userNotifications);

        return ResponseEntity.ok().build();
    }

    /**
     * Map Notification entity to NotificationDto
     */
    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setCreatorName(notification.getCreator().getUsername());
        dto.setTitle(extractTitleFromContent(notification.getContent()));
        dto.setContent(notification.getContent());
        dto.setCreationDate(notification.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        dto.setRead(notification.isRead());
        dto.setId(notification.getId());
        return dto;
    }

    /**
     * Extract title from notification content
     */
    private String extractTitleFromContent(String content) {
        if (content == null || content.isEmpty()) {
            return "Notification";
        }
        
        // Simple title extraction - take first 50 characters or until first period
        String title = content.length() > 50 ? content.substring(0, 50) + "..." : content;
        int periodIndex = title.indexOf('.');
        if (periodIndex > 0 && periodIndex < 30) {
            title = title.substring(0, periodIndex);
        }
        
        return title;
    }
}
