package com.example.demo.dtos;

public class UpdateCommentRequest {
    
    private String content;
    
    public UpdateCommentRequest() {
    }
    
    public UpdateCommentRequest(String content) {
        this.content = content;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
}
