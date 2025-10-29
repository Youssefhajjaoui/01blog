package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

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
     * Upload multiple files and return list of URLs
     * 
     * @param files  Array of files to upload
     * @param folder Optional folder
     * @return List of public URL strings
     */
    public List<String> uploadMultipleFiles(MultipartFile[] files, String folder) throws IOException {
        List<String> urls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = uploadFile(file, folder);
                urls.add(url);
            }
        }

        return urls;
    }

    /**
     * Upload raw bytes with a provided filename and content type.
     * Useful for base64 uploads.
     */
    public String uploadBytes(byte[] bytes, String contentType, String originalFilename, String folder) throws IOException {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("File bytes cannot be empty");
        }

        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        String filePath = (folder != null && !folder.isEmpty()) ? folder + "/" + uniqueFilename : uniqueFilename;

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, filePath);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        if (contentType != null && !contentType.isEmpty()) {
            headers.setContentType(MediaType.parseMediaType(contentType));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(bytes, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to upload file to Supabase: " + response.getBody());
        }

        return getPublicUrl(filePath);
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
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, filePath);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to upload file to Supabase: " + response.getBody());
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
        String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, filePath);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        restTemplate.exchange(
                deleteUrl,
                HttpMethod.DELETE,
                requestEntity,
                String.class);
    }
}