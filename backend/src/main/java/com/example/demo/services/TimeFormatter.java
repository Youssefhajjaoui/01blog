package com.example.demo.services;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class TimeFormatter {

    public static String formatDuration(Duration duration) {
        long seconds = duration.getSeconds();

        if (seconds <= 0) {
            return "expired";
        }

        if (seconds < 60) {
            return seconds + " second" + (seconds != 1 ? "s" : "");
        }

        long minutes = duration.toMinutes();
        if (minutes < 60) {
            return minutes + " minute" + (minutes != 1 ? "s" : "");
        }

        long hours = duration.toHours();
        if (hours < 24) {
            long remainingMinutes = minutes % 60;
            return hours + " hour" + (hours != 1 ? "s" : "") +
                    (remainingMinutes > 0 ? " " + remainingMinutes + " minute" + (remainingMinutes != 1 ? "s" : "")
                            : "");
        }

        long days = duration.toDays();
        long remainingHours = hours % 24;
        return days + " day" + (days != 1 ? "s" : "") +
                (remainingHours > 0 ? " " + remainingHours + " hour" + (remainingHours != 1 ? "s" : "") : "");
    }

    public static String formatBanMessage(LocalDateTime banEnd) {
        Duration duration = Duration.between(LocalDateTime.now(), banEnd);
        return String.format(
                "Your account is temporarily banned. Time remaining: %s.",
                formatDuration(duration));
    }
}