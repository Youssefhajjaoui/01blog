package com.example.demo.dtos;

import java.time.LocalDateTime;

public class CommentDto {
    
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Userdto author;
    
    public CommentDto() {
    }
    
    public CommentDto(Long id, String content, LocalDateTime createdAt, Userdto author) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.author = author;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Userdto getAuthor() {
        return author;
    }
    
    public void setAuthor(Userdto author) {
        this.author = author;
    }
}
