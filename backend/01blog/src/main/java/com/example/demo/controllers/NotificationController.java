package com.example.demo.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.demo.dtos.NotificationDto;

@Controller
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Example: triggered when a new post is created
    public void sendPostNotification(String title) {
        NotificationDto notification = new NotificationDto();
        notification.setTitle(title);
        notification.setContent("A new post was published!");

        // send to all subscribers of /topic/posts
        messagingTemplate.convertAndSend("/topic/posts", notification);
    }
}
 
 