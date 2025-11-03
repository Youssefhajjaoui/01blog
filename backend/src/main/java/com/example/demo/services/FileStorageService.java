package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.storage.bucket}")
    private String bucketName;

    private final RestTemplate restTemplate;

    public FileStorageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Upload single file and return URL
     * 
     * @param file   MultipartFile to upload
     * @param folder Optional folder (e.g., "products", "users", "posts")
     * @return Public URL string to store in database
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        validateFile(file);

        String filePath = generateFilePath(file, folder);
        uploadToSupabase(file, filePath);

        return getPublicUrl(filePath);
    }

    /**
     * Upload raw bytes with a provided filename and content type.
     * Useful for base64 uploads.
     */
    public String uploadBytes(byte[] bytes, String contentType, String originalFilename, String folder)
            throws IOException {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("File bytes cannot be empty");
        }

        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        String filePath = (folder != null && !folder.isEmpty()) ? folder + "/" + uniqueFilename : uniqueFilename;

        // Encode file path components for URL
        String encodedFilePath = encodeFilePath(filePath);
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, encodedFilePath);

        logger.debug("Uploading file to Supabase: {}", uploadUrl);
        logger.debug("File size: {} bytes, Content-Type: {}", bytes.length, contentType);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        if (contentType != null && !contentType.isEmpty()) {
            headers.setContentType(MediaType.parseMediaType(contentType));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(bytes, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorMsg = String.format("Failed to upload file to Supabase. Status: %s, Body: %s",
                        response.getStatusCode(), response.getBody());
                logger.error(errorMsg);
                throw new RuntimeException(errorMsg);
            }

            logger.debug("File uploaded successfully: {}", filePath);
            return getPublicUrl(filePath);
        } catch (RestClientException e) {
            String errorMsg = String.format("I/O error uploading file to Supabase. URL: %s, Error: %s",
                    uploadUrl, e.getMessage());
            logger.error(errorMsg, e);
            throw new IOException(errorMsg, e);
        }
    }

    /**
     * Delete file from Supabase using URL
     * 
     * @param publicUrl The public URL stored in database
     */
    public void deleteFileByUrl(String publicUrl) {
        if (publicUrl == null || publicUrl.isEmpty()) {
            return;
        }

        String filePath = extractFilePath(publicUrl);
        deleteFile(filePath);
    }

    /**
     * Delete multiple files
     * 
     * @param publicUrls List of URLs to delete
     */
    public void deleteMultipleFiles(List<String> publicUrls) {
        if (publicUrls == null || publicUrls.isEmpty()) {
            return;
        }

        for (String url : publicUrls) {
            try {
                deleteFileByUrl(url);
            } catch (Exception e) {
                // Log error but continue deleting other files
                System.err.println("Failed to delete file: " + url + " - " + e.getMessage());
            }
        }
    }

    // ========== Private Helper Methods ==========

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Optional: Add size validation
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        // Optional: Add file type validation
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File type cannot be determined");
        }
    }

    private String generateFilePath(MultipartFile file, String folder) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String uniqueFilename = UUID.randomUUID().toString() + extension;

        return (folder != null && !folder.isEmpty())
                ? folder + "/" + uniqueFilename
                : uniqueFilename;
    }

    private void uploadToSupabase(MultipartFile file, String filePath) throws IOException {
        // Encode file path components for URL
        String encodedFilePath = encodeFilePath(filePath);
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, encodedFilePath);

        logger.debug("Uploading file to Supabase: {}", uploadUrl);
        logger.debug("File name: {}, Size: {} bytes, Content-Type: {}", 
                file.getOriginalFilename(), file.getSize(), file.getContentType());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorMsg = String.format("Failed to upload file to Supabase. Status: %s, Body: %s",
                        response.getStatusCode(), response.getBody());
                logger.error(errorMsg);
                throw new RuntimeException(errorMsg);
            }

            logger.debug("File uploaded successfully: {}", filePath);
        } catch (RestClientException e) {
            String errorMsg = String.format("I/O error uploading file to Supabase. URL: %s, Error: %s",
                    uploadUrl, e.getMessage());
            logger.error(errorMsg, e);
            throw new IOException(errorMsg, e);
        }
    }

    private String getPublicUrl(String filePath) {
        return String.format("%s/storage/v1/object/public/%s/%s",
                supabaseUrl, bucketName, filePath);
    }

    private String extractFilePath(String publicUrl) {
        String prefix = String.format("%s/storage/v1/object/public/%s/",
                supabaseUrl, bucketName);
        return publicUrl.replace(prefix, "");
    }

    private void deleteFile(String filePath) {
        String encodedFilePath = encodeFilePath(filePath);
        String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, encodedFilePath);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(
                    deleteUrl,
                    HttpMethod.DELETE,
                    requestEntity,
                    String.class);
        } catch (RestClientException e) {
            logger.error("Failed to delete file from Supabase: {}", deleteUrl, e);
            // Don't throw - deletion failures are often non-critical
        }
    }

    /**
     * Encode file path components for URL.
     * Encodes each path segment separately to preserve slashes.
     */
    private String encodeFilePath(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return filePath;
        }
        
        // Split by '/' and encode each segment separately
        String[] segments = filePath.split("/");
        StringBuilder encoded = new StringBuilder();
        
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) {
                encoded.append("/");
            }
            // Only encode if segment is not empty
            if (!segments[i].isEmpty()) {
                encoded.append(URLEncoder.encode(segments[i], StandardCharsets.UTF_8));
            }
        }
        
        return encoded.toString();
    }
}