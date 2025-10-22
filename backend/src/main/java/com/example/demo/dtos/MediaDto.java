package com.example.demo.dtos;

public class MediaDto {
    private String type;
    private String url;
    private String alt;

    // Default constructor for Jackson
    public MediaDto() {
    }

    // Constructor with parameters
    public MediaDto(String type, String url, String alt) {
        this.type = type;
        this.url = url;
        this.alt = alt;
    }

    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getAlt() {
        return alt;
    }

    public void setAlt(String alt) {
        this.alt = alt;
    }
}
