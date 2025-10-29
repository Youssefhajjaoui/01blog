package com.example.demo.controllers;

import com.example.demo.services.FileStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Value;
import com.example.demo.models.User;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    private final FileStorageService fileStorageService;

    // Supabase folder inside bucket
    private static final String SUPABASE_FOLDER = "uploads";

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
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

            byte[] bytes = java.util.Base64.getDecoder().decode(base64Data);
            String fileUrl = fileStorageService.uploadBytes(bytes, contentType, filename, SUPABASE_FOLDER);

            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "message", "File uploaded successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    // Local file-serving endpoint removed in favor of direct Supabase public URLs
}
