package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@Service
public class FileStorageService {

    @Value("${file.storage.type:local}")
    private String storageType;

    @Value("${file.storage.local.path:uploads/}")
    private String localPath;

    @Value("${file.storage.base-url:http://localhost:9090/api/files/uploads/}")
    private String baseUrl;

    /**
     * Save base64 image data to storage
     * @param base64Data Base64 encoded image data
     * @param filename Desired filename (without extension)
     * @return Full URL to access the stored file
     */
    public String saveBase64Image(String base64Data, String filename) throws IOException {
        // Extract base64 data (remove data:image/...;base64, prefix)
        if (base64Data.contains(",")) {
            base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
        }

        // Decode base64 to bytes
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        // Generate unique filename
        String uniqueFilename = System.currentTimeMillis() + "_" + filename + ".jpg";
        
        switch (storageType.toLowerCase()) {
            case "local":
                return saveToLocal(imageBytes, uniqueFilename);
            case "s3":
                return saveToS3(imageBytes, uniqueFilename);
            case "gcs":
                return saveToGCS(imageBytes, uniqueFilename);
            case "azure":
                return saveToAzure(imageBytes, uniqueFilename);
            default:
                throw new IllegalArgumentException("Unsupported storage type: " + storageType);
        }
    }

    /**
     * Save file to local filesystem
     */
    private String saveToLocal(byte[] fileBytes, String filename) throws IOException {
        // Ensure directory exists
        File directory = new File(localPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Save file
        Path filePath = Paths.get(localPath, filename);
        Files.write(filePath, fileBytes);

        // Return URL for accessing the file
        return baseUrl + filename;
    }

    /**
     * Save file to AWS S3 (placeholder - requires AWS SDK)
     */
    private String saveToS3(byte[] fileBytes, String filename) throws IOException {
        // TODO: Implement S3 upload using AWS SDK
        // This would require adding AWS SDK dependency to pom.xml
        throw new UnsupportedOperationException("S3 storage not yet implemented. Add AWS SDK dependency.");
    }

    /**
     * Save file to Google Cloud Storage (placeholder - requires GCS SDK)
     */
    private String saveToGCS(byte[] fileBytes, String filename) throws IOException {
        // TODO: Implement GCS upload using Google Cloud Storage SDK
        throw new UnsupportedOperationException("GCS storage not yet implemented. Add Google Cloud Storage SDK dependency.");
    }

    /**
     * Save file to Azure Blob Storage (placeholder - requires Azure SDK)
     */
    private String saveToAzure(byte[] fileBytes, String filename) throws IOException {
        // TODO: Implement Azure Blob upload using Azure SDK
        throw new UnsupportedOperationException("Azure storage not yet implemented. Add Azure SDK dependency.");
    }

    /**
     * Get the storage type currently configured
     */
    public String getStorageType() {
        return storageType;
    }

    /**
     * Get the base URL for file access
     */
    public String getBaseUrl() {
        return baseUrl;
    }
}
