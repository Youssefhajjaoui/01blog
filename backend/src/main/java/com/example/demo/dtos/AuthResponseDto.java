package com.example.demo.dtos;

public class AuthResponseDto {
    private String token;
    // private String username;
    // private String role;
    private String message;

    public AuthResponseDto() {
    }

    public AuthResponseDto(String token, String message) {
        // this.token = token;
        // this.username = username;
        this.token = token;
        this.message = message;
    }

    public AuthResponseDto(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    // public String getUsername() { return username; }
    // public void setUsername(String username) { this.username = username; }

    // public String getRole() { return role; }
    // public void setRole(String role) { this.role = role; }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
