package com.example.demo.services;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.dtos.NotificationDto;

@Service
public class SseNotificationService {

    private final Map<Long, List<SseEmitter>> userIdToEmitters = new ConcurrentHashMap<>();

    public SseEmitter registerEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(0L);
        userIdToEmitters.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> cleanup(userId, emitter));
        emitter.onTimeout(() -> cleanup(userId, emitter));
        emitter.onError(e -> cleanup(userId, emitter));

        try {
            SseEmitter.SseEventBuilder event = SseEmitter.event()
                    .name("connected")
                    .data("connected")
                    .id(String.valueOf(System.currentTimeMillis()))
                    .reconnectTime(5000)
                    .comment("SSE stream established");
            emitter.send(event);
        } catch (IOException ignored) {}

        return emitter;
    }

    public void sendToUser(Long userId, NotificationDto notification) {
        List<SseEmitter> emitters = userIdToEmitters.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification)
                        .id(String.valueOf(System.currentTimeMillis()))
                        .reconnectTime(5000));
            } catch (IOException e) {
                cleanup(userId, emitter);
            }
        }
    }

    private void cleanup(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userIdToEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }
}


