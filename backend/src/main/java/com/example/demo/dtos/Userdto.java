package com.example.demo.dtos;

import com.example.demo.models.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class Userdto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String avatar;
    private UserRole role;

    @JsonIgnore
    private String password;

    // ✅ New fields
    private String bio;

    public Userdto() {
    }

    public Userdto(String username, String email, String password, String photo, String bio) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.bio = bio;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAvatr() {
        return this.avatar;
    }

    public UserRole getRole() {
        return this.role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
