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

    // @Value("${file.storage.local.path:uploads}")
    private Path uploadPath = Paths.get(System.getProperty("user.home"), "uploads");

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

            // Get file extension
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate unique filename
            String filename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;

            // Create uploads directory if it doesn't exist
            Path uploadDir = this.uploadPath;

            logger.info("Upload directory: {}", uploadDir.toString());
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                logger.info("Created upload directory: {}", uploadDir.toString());
            }

            // Save file
            Path filePath = uploadDir.resolve(filename);
            Files.write(filePath, file.getBytes());

            // Return the filename (frontend will construct full URL)
            return ResponseEntity.ok(Map.of(
                    "filename", filename,
                    "url", "http://localhost:9090/api/files/uploads/" + filename,
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

            if (base64Data == null || filename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing base64Data or filename"));
            }

            String fileUrl = fileStorageService.saveBase64Image(base64Data, filename);

            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "message", "File uploaded successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            // Use the configured path
            Path filePath = Paths.get(uploadPath.toString(), filename);
            File file = filePath.toFile();

            logger.info("Looking for file at: {}", filePath.toString());

            if (!file.exists()) {
                logger.error("File not found: {}", filePath.toString());
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            // Determine content type based on file extension
            String contentType = "application/octet-stream";
            String lowerFilename = filename.toLowerCase();

            // Image types
            if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lowerFilename.endsWith(".png")) {
                contentType = "image/png";
            } else if (lowerFilename.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (lowerFilename.endsWith(".webp")) {
                contentType = "image/webp";
            } else if (lowerFilename.endsWith(".svg")) {
                contentType = "image/svg+xml";
            }
            // Video types
            else if (lowerFilename.endsWith(".mp4")) {
                contentType = "video/mp4";
            } else if (lowerFilename.endsWith(".webm")) {
                contentType = "video/webm";
            } else if (lowerFilename.endsWith(".avi")) {
                contentType = "video/x-msvideo";
            } else if (lowerFilename.endsWith(".mov")) {
                contentType = "video/quicktime";
            }
            // Audio types
            else if (lowerFilename.endsWith(".mp3")) {
                contentType = "audio/mpeg";
            } else if (lowerFilename.endsWith(".wav")) {
                contentType = "audio/wav";
            } else if (lowerFilename.endsWith(".ogg")) {
                contentType = "audio/ogg";
            }

            logger.info("Serving file: {} with contentType: {}", filename, contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET")
                    .header(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error serving file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
