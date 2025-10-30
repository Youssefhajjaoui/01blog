package com.example.demo.controllers;

import com.example.demo.services.FileStorageService;
import com.example.demo.services.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.demo.models.User;

import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    private final FileStorageService fileStorageService;
    private final MediaService mediaService;

    // Supabase folder inside bucket
    private static final String SUPABASE_FOLDER = "uploads";

    public FileController(FileStorageService fileStorageService, MediaService mediaService) {
        this.fileStorageService = fileStorageService;
        this.mediaService = mediaService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String url = fileStorageService.uploadFile(file, SUPABASE_FOLDER);

            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "message", "File uploaded successfully"));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/upload-base64")
    public ResponseEntity<Map<String, String>> uploadBase64File(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String base64Data = request.get("base64Data");
            String filename = request.get("filename");
            String contentType = request.getOrDefault("contentType", "application/octet-stream");

            if (base64Data == null || filename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing base64Data or filename"));
            }

            String fileUrl = mediaService.uploadBase64(base64Data, filename, contentType, SUPABASE_FOLDER);

            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "message", "File uploaded successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    // Local file-serving endpoint removed in favor of direct Supabase public URLs
}
