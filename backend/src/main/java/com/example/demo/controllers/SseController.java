package com.example.demo.controllers;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.models.User;
import com.example.demo.services.SseNotificationService;

@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final SseNotificationService sseService;

    public SseController(SseNotificationService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(value = "/notifications", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@AuthenticationPrincipal User user) {
        if (user == null) {
            return null;
        }
        return sseService.registerEmitter(user.getId());
    }
}


