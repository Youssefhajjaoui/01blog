package com.example.demo.services;

import java.io.IOException;

import org.springframework.stereotype.Service;

import com.example.demo.models.MediaType;

@Service
public class MediaService {

    private final FileStorageService fileStorageService;

    public MediaService(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Handle avatar input which can be a direct URL or a data/base64 string.
     * Returns the final public URL to store.
     */
    public String handleAvatarUpload(String avatarInput) throws IOException {
        if (avatarInput == null || avatarInput.isEmpty()) {
            return null;
        }

        String avatar = avatarInput.trim();
        if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
            return avatar;
        }

        String contentType = "image/jpeg";
        String filename = "avatar.jpg";
        String base64Payload = avatar;

        if (avatar.startsWith("data:")) {
            int commaIndex = avatar.indexOf(',');
            if (commaIndex > 0) {
                String header = avatar.substring(0, commaIndex);
                base64Payload = avatar.substring(commaIndex + 1);

                int colonIdx = header.indexOf(':');
                int semiIdx = header.indexOf(';');
                if (colonIdx >= 0 && semiIdx > colonIdx) {
                    contentType = header.substring(colonIdx + 1, semiIdx);
                }

                String ext = ".jpg";
                if (contentType.contains("png")) ext = ".png";
                else if (contentType.contains("jpeg")) ext = ".jpg";
                else if (contentType.contains("jpg")) ext = ".jpg";
                else if (contentType.contains("webp")) ext = ".webp";
                else if (contentType.contains("gif")) ext = ".gif";
                filename = "avatar" + ext;
            }
        }

        byte[] bytes;
        try {
            bytes = java.util.Base64.getDecoder().decode(base64Payload);
        } catch (IllegalArgumentException ex) {
            bytes = java.util.Base64.getUrlDecoder().decode(base64Payload);
        }

        return fileStorageService.uploadBytes(bytes, contentType, filename, "uploads");
    }

    /**
     * Upload a base64 payload directly, handling validation and returning public URL.
     */
    public String uploadBase64(String base64Data, String filename, String contentType, String folder)
            throws IOException {
        if (base64Data == null || base64Data.isEmpty()) {
            throw new IllegalArgumentException("base64Data cannot be empty");
        }
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("filename cannot be empty");
        }

        // Allow data URLs
        String payload = base64Data;
        if (base64Data.startsWith("data:")) {
            int commaIndex = base64Data.indexOf(',');
            if (commaIndex > 0) {
                String header = base64Data.substring(0, commaIndex);
                payload = base64Data.substring(commaIndex + 1);
                if (contentType == null || contentType.isEmpty()) {
                    int colonIdx = header.indexOf(':');
                    int semiIdx = header.indexOf(';');
                    if (colonIdx >= 0 && semiIdx > colonIdx) {
                        contentType = header.substring(colonIdx + 1, semiIdx);
                    }
                }
            }
        }

        byte[] bytes = java.util.Base64.getDecoder().decode(payload);
        return fileStorageService.uploadBytes(bytes,
                contentType != null && !contentType.isEmpty() ? contentType : "application/octet-stream",
                filename,
                folder);
    }

    /**
     * Determine media type from url/path by extension.
     */
    public MediaType determineMediaTypeFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".webm") ||
                lowerUrl.endsWith(".avi") || lowerUrl.endsWith(".mov") ||
                lowerUrl.endsWith(".mkv") || lowerUrl.endsWith(".flv")) {
            return MediaType.VIDEO;
        }
        if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") ||
                lowerUrl.endsWith(".png") || lowerUrl.endsWith(".gif") ||
                lowerUrl.endsWith(".webp") || lowerUrl.endsWith(".svg")) {
            return MediaType.IMAGE;
        }
        return null;
    }
}


